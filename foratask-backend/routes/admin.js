const express=require("express");
const router=express.Router();
const upload = require("../middleware/uploadAvatarMiddleware");

const {empList, assignEmployee, unassignEmployee, addEmployee, getEmployeeTasks}=require('../controllers/adminController');

router.get('/emp-list',empList);
router.get('/employees', empList);
router.get('/employees/:id', async (req, res) => {
  try {
    const User = require('../models/user');
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('supervisor', 'firstName lastName email')
      .populate('subordinates', 'firstName lastName email');
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post('/assign-employee/:id',assignEmployee); //give supervisor id
router.post('/unassign-employee/:id',unassignEmployee); //give supervisor id
router.post('/add-employee',upload.single('avatar'),addEmployee);
router.get('/get-employee-tasks',getEmployeeTasks);

// Admin employee analytics routes
router.get('/admin/employee/:id/attendance', async (req, res) => {
  try {
    const Attendance = require('../models/attendance');
    const OrganizationSettings = require('../models/organizationSettings');
    const User = require('../models/user');
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date(new Date().setDate(1));
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);
    
    const records = await Attendance.find({
      user: req.params.id,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });
    
    // Get org settings for working days calculation
    const orgSettings = await OrganizationSettings.findOne({ company: user.company });
    
    // Calculate stats
    let workingDays = 0;
    let currentDate = new Date(start);
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    while (currentDate <= end && currentDate <= new Date()) {
      const dayName = dayMap[currentDate.getDay()];
      if (orgSettings?.workingDays?.[dayName]) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const presentDays = records.filter(r => r.status === 'present').length;
    const absentDays = workingDays - presentDays - records.filter(r => r.status === 'leave').length;
    const leavesTaken = records.filter(r => r.status === 'leave').length;
    
    res.json({
      records,
      workingDays,
      presentDays,
      absentDays: Math.max(0, absentDays),
      leavesTaken,
      holidays: 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/employee/:id/tasks', async (req, res) => {
  try {
    const Task = require('../models/task');
    
    const tasks = await Task.find({
      $or: [
        { doers: req.params.id },
        { assignees: req.params.id }
      ]
    }).sort({ dueDateTime: -1 }).limit(50);
    
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const overdue = tasks.filter(t => t.status === 'Overdue').length;
    
    res.json({
      tasks,
      total,
      completed,
      inProgress,
      pending,
      overdue
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/admin/employee/:id/salary', async (req, res) => {
  try {
    const SalaryConfig = require('../models/salaryConfig');
    const Attendance = require('../models/attendance');
    const OrganizationSettings = require('../models/organizationSettings');
    const User = require('../models/user');
    
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Employee not found' });
    
    const { month } = req.query;
    const [year, monthNum] = month ? month.split('-') : [new Date().getFullYear(), new Date().getMonth() + 1];
    
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 0);
    
    // Get salary config
    const config = await SalaryConfig.findOne({ user: req.params.id });
    if (!config) return res.json(null);
    
    // Get attendance for the month
    const attendance = await Attendance.find({
      user: req.params.id,
      date: { $gte: startDate, $lte: endDate }
    });
    
    // Get org settings
    const orgSettings = await OrganizationSettings.findOne({ company: user.company });
    const paidLeavesPerMonth = orgSettings?.leave?.paidLeavesPerMonth || 1.5;
    
    // Calculate working days
    let workingDays = 0;
    let currentDate = new Date(startDate);
    const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    while (currentDate <= endDate) {
      const dayName = dayMap[currentDate.getDay()];
      if (orgSettings?.workingDays?.[dayName]) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const leavesTaken = attendance.filter(a => a.status === 'leave').length;
    const paidLeaves = Math.min(leavesTaken, paidLeavesPerMonth);
    const unpaidLeaves = Math.max(0, workingDays - presentDays - paidLeaves);
    
    // Calculate salary
    const dailySalary = config.basicSalary / workingDays;
    const unpaidLeavesDeduction = unpaidLeaves * dailySalary;
    
    // Calculate components
    const earnings = (config.components || [])
      .filter(c => c.type === 'earning')
      .map(c => ({
        ...c.toObject(),
        calculatedAmount: c.isPercentage ? (config.basicSalary * c.amount / 100) : c.amount
      }));
    
    const totalEarnings = config.basicSalary + earnings.reduce((sum, e) => sum + e.calculatedAmount, 0);
    
    // Calculate deductions
    const pfDeduction = config.standardDeductions?.pf?.enabled 
      ? config.basicSalary * (config.standardDeductions.pf.percentage / 100) 
      : 0;
    const ptDeduction = config.standardDeductions?.professionalTax?.enabled
      ? config.standardDeductions.professionalTax.amount
      : 0;
    
    const totalDeductions = pfDeduction + ptDeduction + unpaidLeavesDeduction;
    const netSalary = totalEarnings - totalDeductions;
    
    res.json({
      basicSalary: config.basicSalary,
      components: earnings,
      standardDeductions: config.standardDeductions,
      totalEarnings,
      pfDeduction,
      totalDeductions,
      netSalary,
      workingDays,
      presentDays,
      paidLeaves,
      unpaidLeaves,
      unpaidLeavesDeduction
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports=router;