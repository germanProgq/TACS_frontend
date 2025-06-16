// Database-backed announcements service
import { database, type Announcement } from '../utils/database'

export class AnnouncementsService {
  // Get all active announcements for public display
  async getActiveAnnouncements(): Promise<Announcement[]> {
    return await database.getActiveAnnouncements()
  }

  // Get all announcements for admin management
  async getAllAnnouncements(): Promise<Announcement[]> {
    const announcements = await database.getAll<Announcement>('announcements')
    return announcements.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }

  // Create new announcement
  async createAnnouncement(
    title: string,
    content: string,
    type: 'news' | 'maintenance' | 'feature' | 'alert',
    priority: 'low' | 'medium' | 'high' | 'critical',
    createdBy: string,
    tags: string[] = [],
    expiresAt?: Date
  ): Promise<string> {
    const announcement: Omit<Announcement, 'id' | 'viewCount'> = {
      title,
      content,
      type,
      priority,
      isActive: true,
      publishedAt: new Date(),
      expiresAt,
      createdBy,
      tags
    }

    return await database.createAnnouncement(announcement)
  }

  // Update announcement
  async updateAnnouncement(id: string, updates: Partial<Announcement>): Promise<boolean> {
    try {
      const existingAnnouncement = await database.getById<Announcement>('announcements', id)
      
      if (!existingAnnouncement) {
        return false
      }

      const updatedAnnouncement: Announcement = {
        ...existingAnnouncement,
        ...updates,
        id: existingAnnouncement.id // Ensure ID doesn't change
      }

      await database.update('announcements', updatedAnnouncement)
      await database.logAuditAction(
        'announcement_updated', 
        updates.createdBy || 'system', 
        id, 
        `Updated: ${Object.keys(updates).join(', ')}`
      )
      
      return true
    } catch (error) {
      console.error('[ANNOUNCEMENTS] Failed to update announcement:', error)
      return false
    }
  }

  // Delete announcement
  async deleteAnnouncement(id: string, deletedBy: string): Promise<boolean> {
    try {
      const announcement = await database.getById<Announcement>('announcements', id)
      
      if (!announcement) {
        return false
      }

      await database.delete('announcements', id)
      await database.logAuditAction('announcement_deleted', deletedBy, id, announcement.title)
      
      return true
    } catch (error) {
      console.error('[ANNOUNCEMENTS] Failed to delete announcement:', error)
      return false
    }
  }

  // Toggle announcement active status
  async toggleAnnouncementStatus(id: string, isActive: boolean, updatedBy: string): Promise<boolean> {
    return await this.updateAnnouncement(id, { isActive, createdBy: updatedBy })
  }

  // Increment view count when announcement is viewed
  async incrementViewCount(id: string): Promise<void> {
    try {
      const announcement = await database.getById<Announcement>('announcements', id)
      
      if (announcement) {
        announcement.viewCount = (announcement.viewCount || 0) + 1
        await database.update('announcements', announcement)
      }
    } catch (error) {
      console.error('[ANNOUNCEMENTS] Failed to increment view count:', error)
    }
  }

  // Get announcements by type
  async getAnnouncementsByType(type: 'news' | 'maintenance' | 'feature' | 'alert'): Promise<Announcement[]> {
    return await database.findAllByIndex<Announcement>('announcements', 'type', type)
  }

  // Get announcements by priority
  async getAnnouncementsByPriority(priority: 'low' | 'medium' | 'high' | 'critical'): Promise<Announcement[]> {
    return await database.findAllByIndex<Announcement>('announcements', 'priority', priority)
  }

  // Search announcements by title or content
  async searchAnnouncements(query: string): Promise<Announcement[]> {
    const allAnnouncements = await this.getAllAnnouncements()
    const searchTerm = query.toLowerCase()
    
    return allAnnouncements.filter(announcement => 
      announcement.title.toLowerCase().includes(searchTerm) ||
      announcement.content.toLowerCase().includes(searchTerm) ||
      announcement.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    )
  }

  // Get announcement statistics
  async getAnnouncementStats(): Promise<{
    total: number
    active: number
    inactive: number
    byType: Record<string, number>
    byPriority: Record<string, number>
    totalViews: number
  }> {
    const announcements = await this.getAllAnnouncements()
    
    const stats = {
      total: announcements.length,
      active: announcements.filter(a => a.isActive).length,
      inactive: announcements.filter(a => !a.isActive).length,
      byType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      totalViews: announcements.reduce((sum, a) => sum + (a.viewCount || 0), 0)
    }

    // Count by type
    announcements.forEach(announcement => {
      stats.byType[announcement.type] = (stats.byType[announcement.type] || 0) + 1
      stats.byPriority[announcement.priority] = (stats.byPriority[announcement.priority] || 0) + 1
    })

    return stats
  }
}

// Create singleton instance
export const announcementsService = new AnnouncementsService()
export default announcementsService