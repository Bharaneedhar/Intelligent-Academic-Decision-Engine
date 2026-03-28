const LearningSession = require('../models/LearningSession');
const QuizResult = require('../models/QuizResult');
const Roadmap = require('../models/Roadmap');
const User = require('../models/User');
const PDFDocument = require('pdfkit');

// @desc    Get daily progress report data
// @route   GET /api/reports/daily
// @access  Private
const getDailyReportData = async (req, res) => {
    const userId = req.user.id;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 1. Get learning session for target date
        const session = await LearningSession.findOne({ user: userId, date: targetDate });

        // 2. Get quiz results for target date
        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const quizzesToday = await QuizResult.find({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalQuizScore = quizzesToday.reduce((acc, q) => acc + q.score, 0);
        const avgQuizScore = quizzesToday.length > 0 ? Math.round(totalQuizScore / quizzesToday.length) : 0;

        // 3. Get roadmaps for overall progress
        const roadmaps = await Roadmap.find({ user: userId }).populate('role');

        let totalModules = 0;
        let completedModules = 0;
        let activeRole = 'N/A';

        if (roadmaps.length > 0) {
            activeRole = roadmaps[0].role?.title || 'Custom Role';
            roadmaps.forEach(r => {
                r.roadmap.forEach(phase => {
                    phase.modules.forEach(m => {
                        totalModules++;
                        if (m.completed) completedModules++;
                    });
                });
            });
        }

        const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        // Visual summaries (text-based)
        const modulesCompletedPercent = session?.completedModules?.length ? Math.min(Math.round((session.completedModules.length / 5) * 100), 100) : 0; // Assuming 5 is a target

        const report = {
            userName: user.name,
            date: targetDate,
            activeRole,
            modulesCompletedToday: session?.completedModules?.length || 0,
            quizAttemptsToday: quizzesToday.length,
            averageQuizScore: avgQuizScore,
            learningDuration: session?.sessionDuration || 0, // in seconds
            overallProgress,
            visuals: {
                modulesBar: generateProgressBar(modulesCompletedPercent),
                quizBar: generateProgressBar(avgQuizScore),
                overallBar: generateProgressBar(overallProgress)
            }
        };

        res.json(report);
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Generate daily progress report PDF
// @route   GET /api/reports/daily/pdf
// @access  Private
const generateDailyReportPDF = async (req, res) => {
    const userId = req.user.id;
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const session = await LearningSession.findOne({ user: userId, date: targetDate });

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        const quizzesToday = await QuizResult.find({
            user: userId,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        const totalQuizScore = quizzesToday.reduce((acc, q) => acc + q.score, 0);
        const avgQuizScore = quizzesToday.length > 0 ? Math.round(totalQuizScore / quizzesToday.length) : 0;

        const roadmaps = await Roadmap.find({ user: userId }).populate('role');

        let totalModules = 0;
        let completedModules = 0;
        let activeRole = 'N/A';

        if (roadmaps.length > 0) {
            activeRole = roadmaps[0].role?.title || 'Custom Role';
            roadmaps.forEach(r => {
                r.roadmap.forEach(phase => {
                    phase.modules.forEach(m => {
                        totalModules++;
                        if (m.completed) completedModules++;
                    });
                });
            });
        }

        const overallProgress = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

        // Create PDF
        const doc = new PDFDocument({
            margin: 50,
            size: 'A4',
            bufferPages: true
        });

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Daily_Report_${targetDate}.pdf`);

        // Handle errors in the document stream
        doc.on('error', (err) => {
            console.error('PDFKit stream error:', err);
        });

        doc.pipe(res);

        // Header Branding
        doc.rect(0, 0, 612, 80).fill('#1e293b'); // Slightly wider than A4 to ensure full cover
        doc.fillColor('#ffffff').fontSize(20).font('Helvetica-Bold').text('LearnBuddyyy', 50, 30);
        doc.fontSize(10).font('Helvetica').text('Intelligent Academic Decision Engine', 50, 55);

        // Move cursor down to start content
        doc.y = 110;

        // Report Title
        doc.fillColor('#1e293b').fontSize(24).font('Helvetica-Bold').text('Daily Progress Report');
        doc.fontSize(12).font('Helvetica').fillColor('#64748b').text(`Performance Summary for ${targetDate}`);
        doc.moveDown(2);

        // Section: User Info
        doc.fillColor('#334155').fontSize(14).font('Helvetica-Bold').text('User Information');
        doc.rect(50, doc.y + 5, 500, 1).fill('#e2e8f0');
        doc.moveDown(1.5);

        const infoY = doc.y;
        doc.fontSize(11).font('Helvetica').fillColor('#64748b');
        doc.text('Name:', 60, infoY).fillColor('#1e293b').font('Helvetica-Bold').text(`  ${user.name}`, 120, infoY);
        doc.moveDown(0.5);
        const roleY = doc.y;
        doc.fillColor('#64748b').font('Helvetica').text('Role:', 60, roleY).fillColor('#8b5cf6').font('Helvetica-Bold').text(`  ${activeRole}`, 120, roleY);
        doc.moveDown(2);

        // Section: Activity & Performance
        doc.fillColor('#334155').fontSize(14).font('Helvetica-Bold').text('Learning Activity & Performance', 50, doc.y);
        doc.rect(50, doc.y + 5, 500, 1).fill('#e2e8f0');
        doc.moveDown(1.5);

        // Stats Boxes
        const boxY = doc.y;
        doc.rect(50, boxY, 240, 70).fill('#f8fafc');
        doc.rect(310, boxY, 240, 70).fill('#f8fafc');

        doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('MODULES COMPLETED', 70, boxY + 15);
        doc.fillColor('#1e293b').fontSize(20).text(`${session?.completedModules?.length || 0}`, 70, boxY + 35);

        doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('AVERAGE QUIZ SCORE', 330, boxY + 15);
        doc.fillColor('#10b981').fontSize(20).text(`${avgQuizScore}%`, 330, boxY + 35);

        doc.y = boxY + 90;

        // Learning Time
        const learningTimeStr = formatDuration(session?.sessionDuration || 0);
        doc.fillColor('#1e293b').fontSize(11).font('Helvetica-Bold').text('Learning Time Invested: ', { continued: true }).font('Helvetica').text(learningTimeStr);
        doc.moveDown(2.5);

        // Section: Progress Visualization
        doc.fillColor('#334155').fontSize(14).font('Helvetica-Bold').text('Progress Visualization');
        doc.rect(50, doc.y + 5, 500, 1).fill('#e2e8f0');
        doc.moveDown(1.5);

        const drawBar = (label, percent, color) => {
            doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text(label.toUpperCase());
            doc.moveDown(0.5);

            const barY = doc.y;
            doc.rect(50, barY, 400, 10).fill('#f1f5f9');
            if (percent > 0) {
                doc.rect(50, barY, (Math.min(percent, 100) / 100) * 400, 10).fill(color);
            }
            doc.fillColor('#1e293b').fontSize(10).text(`${percent}%`, 460, barY);
            doc.moveDown(2);
        };

        const moduleGoalPercent = session?.completedModules?.length ? Math.min(Math.round((session.completedModules.length / 5) * 100), 100) : 0;

        drawBar('Daily Module Goal', moduleGoalPercent, '#8b5cf6');
        drawBar('Quiz Performance', avgQuizScore, '#10b981');
        drawBar('Roadmap Progress', overallProgress, '#3b82f6');

        // Footer
        const pageHeight = doc.page.height;
        doc.fillColor('#94a3b8').fontSize(8).font('Helvetica-Oblique')
            .text('Report generated by LearnBuddyyy Academic Engine.', 50, pageHeight - 60, { align: 'center', width: 500 });

        doc.end();

    } catch (error) {
        console.error("PDF Report Error:", error);
        // If we already sent headers, we can't send JSON anymore, 
        // but it's unlikely we hit an error after headers in this specific code.
        if (!res.headersSent) {
            res.status(500).json({ message: 'Error generating report PDF' });
        } else {
            res.end();
        }
    }
};

const generateProgressBar = (percent) => {
    const filled = Math.round(percent / 10);
    const empty = 10 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percent}%`;
};

const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hrs > 0) {
        return `${hrs} hour${hrs > 1 ? 's' : ''} ${mins} minute${mins !== 1 ? 's' : ''}`;
    }
    return `${mins} minute${mins !== 1 ? 's' : ''}`;
};

const formatDate = (dateStr) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateStr).toLocaleDateString(undefined, options);
};

module.exports = {
    getDailyReportData,
    generateDailyReportPDF
};
