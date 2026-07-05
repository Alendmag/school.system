import { MockDatabase, User } from './types';

export class ERPServices {
  private db: MockDatabase;

  constructor(db: MockDatabase) {
    this.db = db;
  }

  getStudentFinances(studentId: string) {
    const invoices = this.db.invoices.filter(i => i.studentId === studentId);
    const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const payments = this.db.payments.filter(p => invoices.some(i => i.id === p.invoiceId));
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = totalInvoiced - totalPaid;
    return { invoices, payments, totalInvoiced, totalPaid, outstanding };
  }
  
  getOverallFinancialStats() {
    const totalInvoiced = this.db.invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = this.db.payments.reduce((sum, p) => sum + p.amount, 0);
    const outstanding = totalInvoiced - totalPaid;
    return { totalInvoiced, totalPaid, outstanding };
  }

  getStudentGPA(studentId: string): number {
    const grades = this.db.grades.filter(g => g.studentId === studentId);
    if (!grades.length) return 0;
    
    let earned = 0;
    let possible = 0;
    
    grades.forEach(g => {
      const assignment = this.db.assignments.find(a => a.id === g.assignmentId);
      if (assignment) {
        earned += g.score;
        possible += assignment.totalMarks;
      }
    });
    
    if (possible === 0) return 85 + Math.random() * 10; // Fallback mock for UI density
    return (earned / possible) * 100;
  }

  getStudentGradesDetailed(studentId: string) {
      return this.db.grades.filter(g => g.studentId === studentId).map(g => {
          const assignment = this.db.assignments.find(a => a.id === g.assignmentId);
          const subject = this.db.subjects.find(s => s.id === assignment?.subjectId);
          return { ...g, assignment, subject };
      });
  }

  getStudentAttendance(studentId: string) {
    const records = this.db.attendance.filter(a => a.studentId === studentId);
    const total = records.length;
    if (total === 0) return { presentCount: 20, absentCount: 1, percentage: 95, records: [] }; // Mock fallback
    
    const presentCount = records.filter(a => a.status === 'present').length;
    const absentCount = records.filter(a => a.status === 'absent' || a.status === 'excused').length;
    const percentage = (presentCount / total) * 100;
    
    return { presentCount, absentCount, percentage, records };
  }
  
  getSchoolAttendanceStats() {
      const records = this.db.attendance;
      const total = records.length;
      if (total === 0) return 96.5; // Mock fallback
      const presentCount = records.filter(a => a.status === 'present').length;
      return (presentCount / total) * 100;
  }

  getParentChildren(guardianId: string) {
    return this.db.students.filter(s => s.guardianId === guardianId);
  }
  
  getNotificationsForUser(user: User | null) {
      if (!user) return [];
      if (user.role === 'admin') return this.db.notifications;
      return this.db.notifications.filter(n => !n.userId || n.userId === user.relatedId);
  }
}
