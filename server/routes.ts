import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { supabaseQuery, schoolFilter } from "./supabase";
import { authMiddleware, requireAuth, supabaseAdmin, getJwt } from "./auth";

function authQuery(req: Request) {
  const jwt = getJwt(req);
  return <T = any>(table: string, options: Parameters<typeof supabaseQuery>[1] = {}) =>
    supabaseQuery<T>(table, { ...options, jwt });
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {

  // === PUBLIC ROUTES (no auth required) ===

  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name, schoolId } = req.body;
    if (!email || !password || !name || !schoolId) {
      return res.status(400).json({ message: "جميع الحقول مطلوبة" });
    }

    const { data: schoolCheck } = await supabaseQuery("schools", {
      filters: `id=eq.${schoolId}`, select: "id", limit: 1,
    });
    if (!schoolCheck || schoolCheck.length === 0) {
      return res.status(400).json({ message: "المدرسة غير موجودة" });
    }

    const { data: authData, error: authErr } = await supabaseAdmin.auth.signUp({
      email,
      password,
    });
    if (authErr) {
      const msg = authErr.message.includes("already been registered")
        ? "البريد الإلكتروني مسجل بالفعل"
        : authErr.message;
      return res.status(400).json({ message: msg });
    }

    const userId = authData.user?.id;
    const accessToken = authData.session?.access_token;
    if (!userId) return res.status(500).json({ message: "فشل إنشاء الحساب" });

    if (accessToken) {
      await supabaseQuery("user_profiles", {
        method: "POST",
        body: { user_id: userId, school_id: schoolId, role: "admin", name },
        jwt: accessToken,
      });
    }

    res.status(201).json({ message: "تم إنشاء الحساب بنجاح" });
  });

  app.post("/api/init", async (_req, res) => {
    const { data: existing } = await supabaseQuery("schools", { select: "id", limit: 1 });
    if (existing && existing.length > 0) {
      return res.json({ school: existing[0], seeded: false });
    }
    const { data: schoolData, error: schoolErr } = await supabaseQuery("schools", { method: "POST", body: { name: "مدرسة التميز النموذجية", type: "school" } });
    if (schoolErr) return res.status(500).json({ message: schoolErr });
    const school = schoolData?.[0];
    if (!school) return res.status(500).json({ message: "فشل إنشاء المدرسة" });
    const sid = school.id;

    const subjectNames = ["الرياضيات","اللغة العربية","اللغة الإنجليزية","العلوم","الفيزياء","الكيمياء","الأحياء","التاريخ","الجغرافيا","التربية الإسلامية","الحاسوب","التربية الفنية","التربية البدنية","الموسيقى","الفلسفة"];
    const subjects = subjectNames.map((name, i) => ({ school_id: sid, name, code: `SUB-${100+i}` }));
    await supabaseQuery("subjects", { method: "POST", body: subjects });

    const classData: any[] = [];
    for (let g = 1; g <= 12; g++) {
      classData.push({ school_id: sid, name: `الصف ${g} - أ`, level: `${g}`, capacity: 30 });
      classData.push({ school_id: sid, name: `الصف ${g} - ب`, level: `${g}`, capacity: 30 });
    }
    [1,2,3,7,10,12].forEach(g => classData.push({ school_id: sid, name: `الصف ${g} - ج`, level: `${g}`, capacity: 30 }));
    const { data: classResult } = await supabaseQuery("classes", { method: "POST", body: classData });

    const guardians = Array.from({ length: 50 }, (_, i) => ({ school_id: sid, name: `ولي أمر ${i+1}`, phone: `091${String(1000000+i).padStart(7,"0")}`, email: `guardian${i+1}@email.com`, relation: "أب" }));
    await supabaseQuery("guardians", { method: "POST", body: guardians });

    const { data: subResult } = await supabaseQuery("subjects", { filters: schoolFilter(sid), select: "id" });
    const subIds = (subResult || []).map((s: any) => s.id);
    const teachers = Array.from({ length: 20 }, (_, i) => ({ school_id: sid, name: `معلم ${i+1}`, email: `teacher${i+1}@school.edu`, phone: `092${String(1000000+i).padStart(7,"0")}`, subject_ids: [subIds[i % subIds.length], subIds[(i+1) % subIds.length]], qualifications: "بكالوريوس التربية", experience_years: (i%15)+1, join_date: "2020-09-01", status: "active" }));
    await supabaseQuery("teachers", { method: "POST", body: teachers });

    const { data: guardResult } = await supabaseQuery("guardians", { filters: schoolFilter(sid), select: "id" });
    const guardIds = (guardResult || []).map((g: any) => g.id);
    const clsIds = (classResult || []).map((c: any) => c.id);
    const clsLevels = (classResult || []).map((c: any) => c.level);
    const students = Array.from({ length: 100 }, (_, i) => ({ school_id: sid, student_id: `STD-${2025000+i+1}`, name: `طالب ${i+1}`, grade_level: clsLevels[i % clsIds.length], class_id: clsIds[i % clsIds.length], guardian_id: guardIds[i % guardIds.length], date_of_birth: `${2008+(i%8)}-${String((i%12)+1).padStart(2,"0")}-${String((i%28)+1).padStart(2,"0")}`, status: "active", enrollment_date: "2024-09-01" }));
    await supabaseQuery("students", { method: "POST", body: students });

    await supabaseQuery("academic_years", { method: "POST", body: [
      { school_id: sid, name: "2024-2025", start_date: "2024-09-01", end_date: "2025-06-30", status: "active" },
      { school_id: sid, name: "2025-2026", start_date: "2025-09-01", end_date: "2026-06-30", status: "upcoming" },
    ]});

    const { data: ayResult } = await supabaseQuery("academic_years", { filters: schoolFilter(sid)+"&status=eq.active", select: "id", limit: 1 });
    const ayId = ayResult?.[0]?.id;
    if (ayId) {
      await supabaseQuery("terms", { method: "POST", body: [
        { school_id: sid, academic_year_id: ayId, name: "الفصل الأول", start_date: "2024-09-01", end_date: "2025-01-15" },
        { school_id: sid, academic_year_id: ayId, name: "الفصل الثاني", start_date: "2025-02-01", end_date: "2025-06-30" },
      ]});
    }

    const { data: stdResult } = await supabaseQuery("students", { filters: schoolFilter(sid), select: "id", limit: 100 });
    const stdIds = (stdResult || []).map((s: any) => s.id);
    const { data: termResult } = await supabaseQuery("terms", { filters: schoolFilter(sid), select: "id", limit: 1 });
    const termId = termResult?.[0]?.id;

    await supabaseQuery("assignments", { method: "POST", body: [
      { school_id: sid, title: "اختبار تجريبي - رياضيات", subject_id: subIds[0], class_id: clsIds[0], due_date: "2025-03-20", type: "quiz", total_marks: 100, status: "active" },
      { school_id: sid, title: "واجب لغة عربية", subject_id: subIds[1], class_id: clsIds[0], due_date: "2025-03-25", type: "homework", total_marks: 50, status: "active" },
    ]});
    if (termId) {
      await supabaseQuery("exams", { method: "POST", body: [{ school_id: sid, title: "اختبارات منتصف الفصل", term_id: termId, type: "midterm", start_date: "2025-03-01", end_date: "2025-03-15", status: "completed" }] });
    }

    const today = new Date().toISOString().split("T")[0];
    const attRecords = stdIds.slice(0,50).map((sId: string, i: number) => ({ school_id: sid, student_id: sId, class_id: clsIds[i % clsIds.length], date: today, status: i%10===0 ? "absent" : "present" }));
    await supabaseQuery("attendance_records", { method: "POST", body: attRecords });

    const invoices = stdIds.slice(0,60).map((sId: string, i: number) => ({ school_id: sid, invoice_number: `INV-${9000+i}`, student_id: sId, title: "قسط دراسي", type: "tuition", amount: 1500, due_date: "2025-04-01", status: i%3===0 ? "pending" : "paid" }));
    await supabaseQuery("invoices", { method: "POST", body: invoices });

    const { data: paidInvoices } = await supabaseQuery("invoices", { filters: schoolFilter(sid)+"&status=eq.paid", select: "id" });
    if (paidInvoices) {
      const payments = paidInvoices.map((inv: any, i: number) => ({ school_id: sid, invoice_id: inv.id, amount: 1500, date: "2025-03-01", method: "bank_transfer", receipt_number: `REC-${1000+i}` }));
      await supabaseQuery("payments", { method: "POST", body: payments });
    }

    const { data: asgResult } = await supabaseQuery("assignments", { filters: schoolFilter(sid), select: "id", limit: 1 });
    if (asgResult?.[0]) {
      const grades = stdIds.slice(0,50).map((sId: string, i: number) => ({ school_id: sid, student_id: sId, assignment_id: asgResult[0].id, score: 70+(i%30), feedback: "عمل جيد" }));
      await supabaseQuery("grade_entries", { method: "POST", body: grades });
    }

    const adminEmail = "admin@school.edu";
    const adminPassword = "SchoolAdmin2025!";
    const { data: authData } = await supabaseAdmin.auth.signUp({
      email: adminEmail,
      password: adminPassword,
    });
    if (authData?.user && authData.session?.access_token) {
      await supabaseQuery("user_profiles", {
        method: "POST",
        body: { user_id: authData.user.id, school_id: sid, role: "admin", name: "د. سامي العلي" },
        jwt: authData.session.access_token,
      });
    }

    res.json({ school, seeded: true, defaultCredentials: { email: adminEmail, password: adminPassword } });
  });

  app.get("/api/auth/schools", async (_req, res) => {
    const { data, error } = await supabaseQuery("schools", { select: "id,name", order: "name.asc" });
    if (error) return res.status(500).json({ message: error });
    res.json(data || []);
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "البريد وكلمة المرور مطلوبان" });
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ message: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    res.json({ access_token: data.session.access_token, refresh_token: data.session.refresh_token, user: data.user });
  });

  app.get("/api/auth/me", authMiddleware, async (req, res) => {
    res.json({
      userId: req.userId,
      schoolId: req.schoolId,
      role: req.userRole,
      name: req.userName,
    });
  });

  // === ALL ROUTES BELOW REQUIRE AUTHENTICATION ===
  app.use("/api", authMiddleware);

  // === STUDENTS ===
  app.get("/api/students", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    let filters = schoolFilter(schoolId);
    const search = req.query.search as string;
    if (search) {
      const sanitized = search.replace(/[^a-zA-Z0-9\u0600-\u06FF\s\-]/g, '');
      filters += `&or=(name.ilike.*${sanitized}*,student_id.ilike.*${sanitized}*)`;
    }
    const { data, error, count } = await q("students", { filters, select: "*", order: "created_at.desc", limit: parseInt(req.query.limit as string) || 100 });
    if (error) return res.status(500).json({ message: error });
    res.json({ data: data || [], count });
  });

  app.get("/api/students/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data, error } = await q("students", { filters: schoolFilter(schoolId)+`&id=eq.${req.params.id}`, select: "*", limit: 1 });
    if (error) return res.status(500).json({ message: error });
    if (!data || data.length === 0) return res.status(404).json({ message: "طالب غير موجود" });
    res.json(data[0]);
  });

  app.post("/api/students", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { name, class_id, guardian_id, date_of_birth, national_id, grade_level, blood_type, medical_conditions } = req.body;
    if (!name) return res.status(400).json({ message: "اسم الطالب مطلوب" });
    const studentId = `STD-${new Date().getFullYear()}${String(Date.now()).slice(-5)}`;
    const { data, error } = await q("students", { method: "POST", body: { school_id: schoolId, student_id: studentId, name, grade_level: grade_level || "1", class_id: class_id || null, guardian_id: guardian_id || null, date_of_birth: date_of_birth || null, national_id: national_id || null, blood_type: blood_type || null, medical_conditions: medical_conditions || null, status: "active" } });
    if (error) return res.status(500).json({ message: error });
    res.status(201).json(data?.[0] || data);
  });

  app.patch("/api/students/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const allowed = ["name","class_id","guardian_id","date_of_birth","national_id","grade_level","status","blood_type","medical_conditions"];
    const updates: Record<string,any> = {};
    for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: "لا توجد بيانات للتحديث" });
    const { data, error } = await q("students", { method: "PATCH", filters: schoolFilter(schoolId)+`&id=eq.${req.params.id}`, body: updates });
    if (error) return res.status(500).json({ message: error });
    if (!data || data.length === 0) return res.status(404).json({ message: "طالب غير موجود أو لا ينتمي لهذه المدرسة" });
    res.json(data[0]);
  });

  app.delete("/api/students/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { error } = await q("students", { method: "DELETE", filters: schoolFilter(schoolId)+`&id=eq.${req.params.id}` });
    if (error) return res.status(500).json({ message: error });
    res.json({ success: true });
  });

  // === STUDENT 360 ===
  app.get("/api/students/:id/360", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const studentId = req.params.id;
    const sf = schoolFilter(schoolId);
    const [studentRes, classesRes, guardiansRes, attendanceRes, invoicesRes, paymentsRes, gradesRes, assignmentsRes] = await Promise.all([
      q("students", { filters: sf+`&id=eq.${studentId}`, select: "*", limit: 1 }),
      q("classes", { filters: sf, select: "*" }),
      q("guardians", { filters: sf, select: "*" }),
      q("attendance_records", { filters: sf+`&student_id=eq.${studentId}`, select: "*", order: "date.desc", limit: 50 }),
      q("invoices", { filters: sf+`&student_id=eq.${studentId}`, select: "*", order: "created_at.desc" }),
      q("payments", { filters: sf, select: "*" }),
      q("grade_entries", { filters: sf+`&student_id=eq.${studentId}`, select: "*" }),
      q("assignments", { filters: sf, select: "*" }),
    ]);
    if (!studentRes.data || studentRes.data.length === 0) return res.status(404).json({ message: "طالب غير موجود" });
    const student = studentRes.data[0];
    const cls = (classesRes.data || []).find((c: any) => c.id === student.class_id);
    const guardian = (guardiansRes.data || []).find((g: any) => g.id === student.guardian_id);
    const studentInvoices = invoicesRes.data || [];
    const invoiceIds = new Set(studentInvoices.map((i: any) => i.id));
    const studentPayments = (paymentsRes.data || []).filter((p: any) => invoiceIds.has(p.invoice_id));
    const totalInvoiced = studentInvoices.reduce((s: number, i: any) => s + Number(i.amount), 0);
    const totalPaid = studentPayments.reduce((s: number, p: any) => s + Number(p.amount), 0);
    const attRecords = attendanceRes.data || [];
    const attTotal = attRecords.length;
    const attPresent = attRecords.filter((a: any) => a.status === "present" || a.status === "late").length;
    const gradeRecords = gradesRes.data || [];
    const assignments = assignmentsRes.data || [];
    let earned = 0, possible = 0;
    for (const g of gradeRecords) { const asg = assignments.find((a: any) => a.id === g.assignment_id); if (asg) { earned += Number(g.score); possible += Number(asg.total_marks); } }
    res.json({
      student, class: cls || null, guardian: guardian || null,
      attendance: { records: attRecords, total: attTotal, present: attPresent, absent: attTotal - attPresent, percentage: attTotal > 0 ? (attPresent / attTotal) * 100 : 0 },
      finance: { invoices: studentInvoices, payments: studentPayments, totalInvoiced, totalPaid, outstanding: totalInvoiced - totalPaid },
      academic: { grades: gradeRecords, gpa: possible > 0 ? (earned / possible) * 100 : 0 },
    });
  });

  // === CLASSES ===
  app.get("/api/classes", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    let filters = schoolFilter(schoolId);
    const level = req.query.level as string;
    if (level) filters += `&level=eq.${level}`;
    if (req.query.academic_year_id) filters += `&academic_year_id=eq.${req.query.academic_year_id}`;
    const { data, error } = await q("classes", { filters, select: "*", order: "level.asc,name.asc" });
    if (error) return res.status(500).json({ message: error });
    res.json(data || []);
  });

  app.get("/api/guardians", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data, error } = await q("guardians", { filters: schoolFilter(schoolId), select: "*", order: "name.asc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  app.get("/api/subjects", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data, error } = await q("subjects", { filters: schoolFilter(schoolId), select: "*", order: "name.asc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  app.get("/api/teachers", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data, error } = await q("teachers", { filters: schoolFilter(schoolId), select: "*", order: "name.asc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  // === ATTENDANCE ===
  app.get("/api/attendance", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    let filters = schoolFilter(schoolId);
    if (req.query.date) filters += `&date=eq.${req.query.date}`;
    if (req.query.class_id) filters += `&class_id=eq.${req.query.class_id}`;
    const { data, error } = await q("attendance_records", { filters, select: "*", order: "date.desc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  app.post("/api/attendance", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const records = req.body.records;
    if (!Array.isArray(records) || records.length === 0) return res.status(400).json({ message: "يجب إرسال سجلات الحضور" });
    const upsertData = records.map((r: any) => ({ school_id: schoolId, student_id: r.student_id, class_id: r.class_id, date: r.date, status: r.status || "present", notes: r.notes || null, updated_at: new Date().toISOString() }));
    const { data, error } = await q("attendance_records", { method: "POST", body: upsertData, prefer: "resolution=merge-duplicates,return=representation", onConflict: "school_id,student_id,class_id,date" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  // === INVOICES ===
  app.get("/api/invoices", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    let filters = schoolFilter(schoolId);
    if (req.query.student_id) filters += `&student_id=eq.${req.query.student_id}`;
    const { data, error } = await q("invoices", { filters, select: "*", order: "created_at.desc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  app.post("/api/invoices", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { student_id, title, type, amount } = req.body;
    if (!student_id || !amount) return res.status(400).json({ message: "بيانات الفاتورة غير مكتملة" });
    const { data: studentCheck } = await q("students", { filters: schoolFilter(schoolId)+`&id=eq.${student_id}`, select: "id", limit: 1 });
    if (!studentCheck || studentCheck.length === 0) return res.status(403).json({ message: "الطالب لا ينتمي لهذه المدرسة" });
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const { data, error } = await q("invoices", { method: "POST", body: { school_id: schoolId, invoice_number: invoiceNumber, student_id, title: title || "قسط دراسي", type: type || "tuition", amount: Number(amount), due_date: new Date(Date.now()+15*86400000).toISOString().split("T")[0], status: "pending" } });
    if (error) return res.status(500).json({ message: error }); res.status(201).json(data?.[0] || data);
  });

  app.get("/api/payments", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data, error } = await q("payments", { filters: schoolFilter(schoolId), select: "*", order: "created_at.desc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  app.get("/api/grades", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data, error } = await q("grade_entries", { filters: schoolFilter(schoolId), select: "*", order: "created_at.desc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  app.get("/api/assignments", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data, error } = await q("assignments", { filters: schoolFilter(schoolId), select: "*", order: "created_at.desc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  app.get("/api/exams", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data, error } = await q("exams", { filters: schoolFilter(schoolId), select: "*" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  // === ACADEMIC YEARS ===
  app.get("/api/academic-years", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data, error } = await q("academic_years", { filters: schoolFilter(schoolId), select: "*", order: "start_date.desc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  app.post("/api/academic-years", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { name, start_date, end_date, status } = req.body;
    if (!name || !start_date || !end_date) return res.status(400).json({ message: "اسم السنة وتاريخ البداية والنهاية مطلوبة" });
    if (start_date >= end_date) return res.status(400).json({ message: "تاريخ البداية يجب أن يسبق تاريخ النهاية" });
    const { data, error } = await q("academic_years", { method: "POST", body: { school_id: schoolId, name, start_date, end_date, status: status || "upcoming" } });
    if (error) return res.status(500).json({ message: error });
    res.status(201).json(data?.[0] || data);
  });

  app.patch("/api/academic-years/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const allowed = ["name", "start_date", "end_date", "status"];
    const updates: Record<string, any> = {};
    for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: "لا توجد بيانات للتحديث" });
    if (updates.start_date && updates.end_date && updates.start_date >= updates.end_date) return res.status(400).json({ message: "تاريخ البداية يجب أن يسبق تاريخ النهاية" });
    const { data, error } = await q("academic_years", { method: "PATCH", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}`, body: updates });
    if (error) return res.status(500).json({ message: error });
    if (!data || data.length === 0) return res.status(404).json({ message: "السنة الدراسية غير موجودة" });
    res.json(data[0]);
  });

  app.delete("/api/academic-years/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const ayFilter = schoolFilter(schoolId) + `&academic_year_id=eq.${req.params.id}`;
    const [termDeps, classDeps, taDeps] = await Promise.all([
      q("terms", { filters: ayFilter, select: "id", limit: 1 }),
      q("classes", { filters: ayFilter, select: "id", limit: 1 }),
      q("teacher_assignments", { filters: ayFilter, select: "id", limit: 1 }),
    ]);
    if (termDeps.data?.length) return res.status(409).json({ message: "لا يمكن حذف سنة دراسية تحتوي على فصول دراسية" });
    if (classDeps.data?.length) return res.status(409).json({ message: "لا يمكن حذف سنة دراسية مرتبطة بشُعب" });
    if (taDeps.data?.length) return res.status(409).json({ message: "لا يمكن حذف سنة دراسية مرتبطة بتوزيع معلمين" });
    const { error } = await q("academic_years", { method: "DELETE", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}` });
    if (error) return res.status(500).json({ message: error });
    res.json({ success: true });
  });

  // === TERMS ===
  app.get("/api/terms", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    let filters = schoolFilter(schoolId);
    if (req.query.academic_year_id) filters += `&academic_year_id=eq.${req.query.academic_year_id}`;
    const { data, error } = await q("terms", { filters, select: "*", order: "start_date.asc" });
    if (error) return res.status(500).json({ message: error }); res.json(data || []);
  });

  app.post("/api/terms", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { academic_year_id, name, start_date, end_date } = req.body;
    if (!academic_year_id || !name || !start_date || !end_date) return res.status(400).json({ message: "جميع حقول الفصل الدراسي مطلوبة" });
    if (start_date >= end_date) return res.status(400).json({ message: "تاريخ البداية يجب أن يسبق تاريخ النهاية" });
    const { data: ayCheck } = await q("academic_years", { filters: schoolFilter(schoolId) + `&id=eq.${academic_year_id}`, select: "id,start_date,end_date", limit: 1 });
    if (!ayCheck || ayCheck.length === 0) return res.status(400).json({ message: "السنة الدراسية غير موجودة" });
    const ay = ayCheck[0];
    if (start_date < ay.start_date || end_date > ay.end_date) return res.status(400).json({ message: "تواريخ الفصل يجب أن تقع ضمن نطاق السنة الدراسية" });
    const { data, error } = await q("terms", { method: "POST", body: { school_id: schoolId, academic_year_id, name, start_date, end_date } });
    if (error) return res.status(500).json({ message: error });
    res.status(201).json(data?.[0] || data);
  });

  app.patch("/api/terms/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const allowed = ["name", "start_date", "end_date"];
    const updates: Record<string, any> = {};
    for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: "لا توجد بيانات للتحديث" });
    if (updates.start_date && updates.end_date && updates.start_date >= updates.end_date) return res.status(400).json({ message: "تاريخ البداية يجب أن يسبق تاريخ النهاية" });
    const { data: existing } = await q("terms", { filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}`, select: "academic_year_id", limit: 1 });
    if (!existing?.length) return res.status(404).json({ message: "الفصل الدراسي غير موجود" });
    const { data: ayData } = await q("academic_years", { filters: schoolFilter(schoolId) + `&id=eq.${existing[0].academic_year_id}`, select: "start_date,end_date", limit: 1 });
    if (ayData?.length) {
      const sd = updates.start_date || undefined;
      const ed = updates.end_date || undefined;
      if ((sd && sd < ayData[0].start_date) || (ed && ed > ayData[0].end_date)) return res.status(400).json({ message: "تواريخ الفصل يجب أن تقع ضمن نطاق السنة الدراسية" });
    }
    const { data, error } = await q("terms", { method: "PATCH", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}`, body: updates });
    if (error) return res.status(500).json({ message: error });
    if (!data || data.length === 0) return res.status(404).json({ message: "الفصل الدراسي غير موجود" });
    res.json(data[0]);
  });

  app.delete("/api/terms/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data: deps } = await q("exams", { filters: schoolFilter(schoolId) + `&term_id=eq.${req.params.id}`, select: "id", limit: 1 });
    if (deps && deps.length > 0) return res.status(409).json({ message: "لا يمكن حذف فصل يحتوي على اختبارات" });
    const { error } = await q("terms", { method: "DELETE", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}` });
    if (error) return res.status(500).json({ message: error });
    res.json({ success: true });
  });

  // === CLASSES (CRUD) ===
  app.post("/api/classes", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { name, level, capacity, advisor_id, academic_year_id } = req.body;
    if (!name || !level || !academic_year_id) return res.status(400).json({ message: "اسم الفصل والمرحلة والسنة الدراسية مطلوبة" });
    const { data: ayCheck } = await q("academic_years", { filters: schoolFilter(schoolId) + `&id=eq.${academic_year_id}`, select: "id", limit: 1 });
    if (!ayCheck?.length) return res.status(400).json({ message: "السنة الدراسية غير موجودة في هذه المدرسة" });
    if (advisor_id) {
      const { data: advCheck } = await q("teachers", { filters: schoolFilter(schoolId) + `&id=eq.${advisor_id}`, select: "id", limit: 1 });
      if (!advCheck?.length) return res.status(400).json({ message: "المرشد الأكاديمي غير موجود في هذه المدرسة" });
    }
    const { data, error } = await q("classes", { method: "POST", body: { school_id: schoolId, name, level, capacity: capacity || 30, advisor_id: advisor_id || null, academic_year_id } });
    if (error) return res.status(500).json({ message: error });
    res.status(201).json(data?.[0] || data);
  });

  app.patch("/api/classes/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const allowed = ["name", "level", "capacity", "advisor_id", "academic_year_id"];
    const updates: Record<string, any> = {};
    for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: "لا توجد بيانات للتحديث" });
    if (updates.academic_year_id) {
      const { data: ayCheck } = await q("academic_years", { filters: schoolFilter(schoolId) + `&id=eq.${updates.academic_year_id}`, select: "id", limit: 1 });
      if (!ayCheck?.length) return res.status(400).json({ message: "السنة الدراسية غير موجودة في هذه المدرسة" });
    }
    if (updates.advisor_id) {
      const { data: advCheck } = await q("teachers", { filters: schoolFilter(schoolId) + `&id=eq.${updates.advisor_id}`, select: "id", limit: 1 });
      if (!advCheck?.length) return res.status(400).json({ message: "المرشد الأكاديمي غير موجود في هذه المدرسة" });
    }
    const { data, error } = await q("classes", { method: "PATCH", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}`, body: updates });
    if (error) return res.status(500).json({ message: error });
    if (!data || data.length === 0) return res.status(404).json({ message: "الفصل غير موجود" });
    res.json(data[0]);
  });

  app.delete("/api/classes/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const clsFilter = schoolFilter(schoolId) + `&class_id=eq.${req.params.id}`;
    const [studentDeps, taDeps] = await Promise.all([
      q("students", { filters: clsFilter, select: "id", limit: 1 }),
      q("teacher_assignments", { filters: clsFilter, select: "id", limit: 1 }),
    ]);
    if (studentDeps.data?.length) return res.status(409).json({ message: "لا يمكن حذف فصل يحتوي على طلاب" });
    if (taDeps.data?.length) return res.status(409).json({ message: "لا يمكن حذف فصل مرتبط بتوزيع معلمين" });
    const { error } = await q("classes", { method: "DELETE", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}` });
    if (error) return res.status(500).json({ message: error });
    res.json({ success: true });
  });

  // === SUBJECTS (CRUD) ===
  app.post("/api/subjects", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { name, code } = req.body;
    if (!name || !code) return res.status(400).json({ message: "اسم المادة والرمز مطلوبان" });
    const { data, error } = await q("subjects", { method: "POST", body: { school_id: schoolId, name, code } });
    if (error) return res.status(500).json({ message: error });
    res.status(201).json(data?.[0] || data);
  });

  app.patch("/api/subjects/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const allowed = ["name", "code"];
    const updates: Record<string, any> = {};
    for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: "لا توجد بيانات للتحديث" });
    const { data, error } = await q("subjects", { method: "PATCH", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}`, body: updates });
    if (error) return res.status(500).json({ message: error });
    if (!data || data.length === 0) return res.status(404).json({ message: "المادة غير موجودة" });
    res.json(data[0]);
  });

  app.delete("/api/subjects/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data: deps } = await q("teacher_assignments", { filters: schoolFilter(schoolId) + `&subject_id=eq.${req.params.id}`, select: "id", limit: 1 });
    if (deps && deps.length > 0) return res.status(409).json({ message: "لا يمكن حذف مادة مرتبطة بتوزيع معلمين" });
    const { error } = await q("subjects", { method: "DELETE", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}` });
    if (error) return res.status(500).json({ message: error });
    res.json({ success: true });
  });

  // === TEACHERS (CRUD) ===
  app.post("/api/teachers", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { name, email, phone, subject_ids, qualifications, experience_years, join_date, status } = req.body;
    if (!name) return res.status(400).json({ message: "اسم المعلم مطلوب" });
    const { data, error } = await q("teachers", { method: "POST", body: {
      school_id: schoolId, name, email: email || null, phone: phone || null,
      subject_ids: subject_ids || [], qualifications: qualifications || null,
      experience_years: experience_years || 0, join_date: join_date || new Date().toISOString().split("T")[0],
      status: status || "active",
    }});
    if (error) return res.status(500).json({ message: error });
    res.status(201).json(data?.[0] || data);
  });

  app.patch("/api/teachers/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const allowed = ["name", "email", "phone", "subject_ids", "qualifications", "experience_years", "join_date", "status"];
    const updates: Record<string, any> = {};
    for (const key of allowed) { if (req.body[key] !== undefined) updates[key] = req.body[key]; }
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: "لا توجد بيانات للتحديث" });
    const { data, error } = await q("teachers", { method: "PATCH", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}`, body: updates });
    if (error) return res.status(500).json({ message: error });
    if (!data || data.length === 0) return res.status(404).json({ message: "المعلم غير موجود" });
    res.json(data[0]);
  });

  app.delete("/api/teachers/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { data: deps } = await q("teacher_assignments", { filters: schoolFilter(schoolId) + `&teacher_id=eq.${req.params.id}`, select: "id", limit: 1 });
    if (deps && deps.length > 0) return res.status(409).json({ message: "لا يمكن حذف معلم لديه توزيع حصص" });
    const { error } = await q("teachers", { method: "DELETE", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}` });
    if (error) return res.status(500).json({ message: error });
    res.json({ success: true });
  });

  // === TEACHER ASSIGNMENTS ===
  app.get("/api/teacher-assignments", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    let filters = schoolFilter(schoolId);
    if (req.query.academic_year_id) filters += `&academic_year_id=eq.${req.query.academic_year_id}`;
    if (req.query.teacher_id) filters += `&teacher_id=eq.${req.query.teacher_id}`;
    if (req.query.class_id) filters += `&class_id=eq.${req.query.class_id}`;
    const { data, error } = await q("teacher_assignments", { filters, select: "*", order: "created_at.desc" });
    if (error) return res.status(500).json({ message: error });
    res.json(data || []);
  });

  app.post("/api/teacher-assignments", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { teacher_id, subject_id, class_id, academic_year_id } = req.body;
    if (!teacher_id || !subject_id || !class_id || !academic_year_id) return res.status(400).json({ message: "جميع حقول التوزيع مطلوبة" });
    const [tCheck, sCheck, cCheck, ayCheck] = await Promise.all([
      q("teachers", { filters: schoolFilter(schoolId) + `&id=eq.${teacher_id}`, select: "id", limit: 1 }),
      q("subjects", { filters: schoolFilter(schoolId) + `&id=eq.${subject_id}`, select: "id", limit: 1 }),
      q("classes", { filters: schoolFilter(schoolId) + `&id=eq.${class_id}`, select: "id", limit: 1 }),
      q("academic_years", { filters: schoolFilter(schoolId) + `&id=eq.${academic_year_id}`, select: "id", limit: 1 }),
    ]);
    if (!tCheck.data?.length) return res.status(400).json({ message: "المعلم غير موجود في هذه المدرسة" });
    if (!sCheck.data?.length) return res.status(400).json({ message: "المادة غير موجودة في هذه المدرسة" });
    if (!cCheck.data?.length) return res.status(400).json({ message: "الفصل غير موجود في هذه المدرسة" });
    if (!ayCheck.data?.length) return res.status(400).json({ message: "السنة الدراسية غير موجودة في هذه المدرسة" });
    const { data: clsData } = await q("classes", { filters: schoolFilter(schoolId) + `&id=eq.${class_id}`, select: "academic_year_id", limit: 1 });
    if (clsData?.[0]?.academic_year_id && clsData[0].academic_year_id !== academic_year_id) return res.status(400).json({ message: "الشعبة لا تنتمي للسنة الدراسية المختارة" });
    const { data, error } = await q("teacher_assignments", { method: "POST", body: { school_id: schoolId, teacher_id, subject_id, class_id, academic_year_id } });
    if (error) {
      if (typeof error === 'string' && error.includes('duplicate')) return res.status(409).json({ message: "هذا التوزيع موجود مسبقاً" });
      return res.status(500).json({ message: error });
    }
    res.status(201).json(data?.[0] || data);
  });

  app.patch("/api/teacher-assignments/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { teacher_id, subject_id, class_id, academic_year_id } = req.body;
    const updates: Record<string, any> = {};
    if (teacher_id) updates.teacher_id = teacher_id;
    if (subject_id) updates.subject_id = subject_id;
    if (class_id) updates.class_id = class_id;
    if (academic_year_id) updates.academic_year_id = academic_year_id;
    if (Object.keys(updates).length === 0) return res.status(400).json({ message: "لا توجد بيانات للتحديث" });
    const { data: existing } = await q("teacher_assignments", { filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}`, select: "*", limit: 1 });
    if (!existing?.length) return res.status(404).json({ message: "التوزيع غير موجود" });
    const merged = { ...existing[0], ...updates };
    const [tCheck, sCheck, cCheck, ayCheck] = await Promise.all([
      q("teachers", { filters: schoolFilter(schoolId) + `&id=eq.${merged.teacher_id}`, select: "id", limit: 1 }),
      q("subjects", { filters: schoolFilter(schoolId) + `&id=eq.${merged.subject_id}`, select: "id", limit: 1 }),
      q("classes", { filters: schoolFilter(schoolId) + `&id=eq.${merged.class_id}`, select: "id,academic_year_id", limit: 1 }),
      q("academic_years", { filters: schoolFilter(schoolId) + `&id=eq.${merged.academic_year_id}`, select: "id", limit: 1 }),
    ]);
    if (!tCheck.data?.length) return res.status(400).json({ message: "المعلم غير موجود في هذه المدرسة" });
    if (!sCheck.data?.length) return res.status(400).json({ message: "المادة غير موجودة في هذه المدرسة" });
    if (!cCheck.data?.length) return res.status(400).json({ message: "الفصل غير موجود في هذه المدرسة" });
    if (!ayCheck.data?.length) return res.status(400).json({ message: "السنة الدراسية غير موجودة في هذه المدرسة" });
    if (cCheck.data[0].academic_year_id && cCheck.data[0].academic_year_id !== merged.academic_year_id) return res.status(400).json({ message: "الشعبة لا تنتمي للسنة الدراسية المختارة" });
    updates.updated_at = new Date().toISOString();
    const { data, error } = await q("teacher_assignments", { method: "PATCH", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}`, body: updates });
    if (error) {
      if (typeof error === 'string' && error.includes('duplicate')) return res.status(409).json({ message: "هذا التوزيع موجود مسبقاً" });
      return res.status(500).json({ message: error });
    }
    if (!data || data.length === 0) return res.status(404).json({ message: "التوزيع غير موجود" });
    res.json(data[0]);
  });

  app.delete("/api/teacher-assignments/:id", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const { error } = await q("teacher_assignments", { method: "DELETE", filters: schoolFilter(schoolId) + `&id=eq.${req.params.id}` });
    if (error) return res.status(500).json({ message: error });
    res.json({ success: true });
  });

  // === REPORTS ===
  app.get("/api/reports/summary", async (req, res) => {
    const schoolId = requireAuth(req, res); if (!schoolId) return;
    const q = authQuery(req);
    const sf = schoolFilter(schoolId);
    const [studentsR, teachersR, classesR, subjectsR, invoicesR, paymentsR, attendanceR, gradesR, assignmentsR] = await Promise.all([
      q("students", { filters: sf, select: "id,status,grade_level", limit: 10000 }),
      q("teachers", { filters: sf, select: "id", limit: 10000 }),
      q("classes", { filters: sf, select: "id,level,name", limit: 10000 }),
      q("subjects", { filters: sf, select: "id,name", limit: 10000 }),
      q("invoices", { filters: sf, select: "id,amount,status,student_id,type", limit: 10000 }),
      q("payments", { filters: sf, select: "id,amount", limit: 10000 }),
      q("attendance_records", { filters: sf, select: "id,status,class_id,date", limit: 10000 }),
      q("grade_entries", { filters: sf, select: "id,student_id,assignment_id,score", limit: 10000 }),
      q("assignments", { filters: sf, select: "id,subject_id,total_marks", limit: 10000 }),
    ]);
    const students = studentsR.data||[], teachers = teachersR.data||[], classes = classesR.data||[];
    const subjects = subjectsR.data||[], invoices = invoicesR.data||[], payments = paymentsR.data||[];
    const attendance = attendanceR.data||[], grades = gradesR.data||[], assignments = assignmentsR.data||[];

    const totalInvoiced = invoices.reduce((s: number, i: any) => s + Number(i.amount), 0);
    const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount), 0);
    const financeByType: Record<string,number> = {};
    for (const inv of invoices) financeByType[inv.type] = (financeByType[inv.type]||0) + Number(inv.amount);

    const attTotal = attendance.length;
    const attPresent = attendance.filter((a: any) => a.status==="present"||a.status==="late").length;
    const attAbsent = attendance.filter((a: any) => a.status==="absent").length;

    const attByClass: Record<string,{total:number;present:number;className:string}> = {};
    for (const a of attendance) {
      if (!attByClass[a.class_id]) { const cls = classes.find((c: any) => c.id === a.class_id); attByClass[a.class_id] = { total: 0, present: 0, className: cls?.name || "غير محدد" }; }
      attByClass[a.class_id].total++; if (a.status==="present"||a.status==="late") attByClass[a.class_id].present++;
    }

    const subjectScores: Record<string,{earned:number;possible:number;name:string}> = {};
    for (const g of grades) {
      const asg = assignments.find((a: any) => a.id === g.assignment_id);
      if (asg) { const subId = asg.subject_id||"x"; const sub = subjects.find((s: any) => s.id === asg.subject_id);
        if (!subjectScores[subId]) subjectScores[subId] = { earned:0, possible:0, name: sub?.name||"غير محدد" };
        subjectScores[subId].earned += Number(g.score); subjectScores[subId].possible += Number(asg.total_marks); }
    }
    let totalEarned = 0, totalPossible = 0;
    for (const g of grades) { const asg = assignments.find((a: any) => a.id === g.assignment_id); if (asg) { totalEarned += Number(g.score); totalPossible += Number(asg.total_marks); } }

    const studentsByGrade: Record<string,number> = {};
    for (const s of students) studentsByGrade[s.grade_level] = (studentsByGrade[s.grade_level]||0)+1;

    res.json({
      counts: { students: students.length, activeStudents: students.filter((s: any) => s.status==="active").length, teachers: teachers.length, classes: classes.length, subjects: subjects.length },
      finance: { totalInvoiced, totalPaid, outstanding: totalInvoiced - totalPaid, paidInvoiceCount: invoices.filter((i: any) => i.status==="paid").length, pendingInvoiceCount: invoices.filter((i: any) => i.status==="pending").length, byType: financeByType },
      attendance: { total: attTotal, present: attPresent, absent: attAbsent, percentage: attTotal>0?(attPresent/attTotal)*100:0, byClass: Object.values(attByClass).map(v => ({ className: v.className, total: v.total, present: v.present, percentage: v.total>0?(v.present/v.total)*100:0 })) },
      academic: { overallGPA: totalPossible>0?(totalEarned/totalPossible)*100:0, subjectAverages: Object.entries(subjectScores).map(([id,v]) => ({ id, name: v.name, average: v.possible>0?(v.earned/v.possible)*100:0 })), gradedStudents: new Set(grades.map((g: any) => g.student_id)).size },
      studentsByGrade,
    });
  });

  return httpServer;
}
