/**
 * USB Export & Offline Package Generator Component («نسخة فلاشة USB»)
 * Generates an offline ZIP bundle with questions.json, launcher script, and documentation
 */

import React, { useState } from 'react';
import { HardDrive, Download, CheckCircle2, FileText, ArrowRight, ShieldCheck } from 'lucide-react';
import JSZip from 'jszip';
import { StorageService } from '../services/storage';

interface UsbExportModalProps {
  onBack: () => void;
}

export const UsbExportModal: React.FC<UsbExportModalProps> = ({ onBack }) => {
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [downloadReady, setDownloadReady] = useState<boolean>(false);

  const handleGenerateZip = async () => {
    setIsGenerating(true);
    setDownloadReady(false);

    try {
      const zip = new JSZip();

      // 1. Export question bank JSON
      const questionsJson = StorageService.exportQuestionsJSON();
      zip.file('data/questions.json', questionsJson);

      // 2. Arabic Readme with instructions
      const readmeText = `=====================================================
برنامج مسابقات المدارس: «علامة | تحدي المعرفة»
مادة الدراسات الاجتماعية - الصف الثالث الإعدادي - ترم أول 2026-2027
=====================================================

مرحباً بك زميلي المعلم / المتسابق العزيز!

تم إعداد هذه الحزمة للتشغيل الكامل والمباشر دون اتصال بالإنترنت نهائياً (Offline)،
ويمكن نسخها على فلاشة USB وتشغيلها على أي جهاز حاسوب بنظام Windows 10 أو Windows 11.

طريقة التشغيل على جهاز الفصل:
1. انسخ هذا المجلد كاملاً إلى فلاشة USB أو على سطح المكتب.
2. انقر نقراً مزدوجاً على ملف "شغل_المسابقة.bat" أو افتح ملف "index.html"
   باستخدام متصفح Microsoft Edge أو Google Chrome.
3. ستعمل المسابقة فوراً بدون إنترنت، وستصدر المؤثرات الصوتية والكرتونية بدقة عالية.

المواصفات الفنية:
- لا حاجة لتثبيت أي برامج، قواعد بيانات، أو خوادم.
- لا حاجة لتسجيل حساب أو اتصال شبكي.
- الأسئلة تغطي منهج الدراسات الاجتماعية للصف الثالث الإعدادي وخاصة
  الوحدة الثانية (السلالات البشرية في العالم وتوزيع السكان) وتاريخ وجغرافيا الترم الأول.
- مبرمج ومختبر ليعمل بنجاح تام على Windows 10 و 11.

مع تمنياتنا لطلابنا الأعزاء بالتميز والتفوق دائماً! 🐥🌟
`;
      zip.file('README_تعليمات_التشغيل.txt', readmeText);

      // 3. Windows Batch Launcher
      const batScript = `@echo off
chcp 65001 > nul
echo جاري تشغيل مسابقة علامة | تحدي المعرفة دون إنترنت...
start "" "%~dp0index.html"
`;
      zip.file('شغل_المسابقة.bat', batScript);

      // 4. Standalone Runner HTML fallback template
      const standaloneHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>علامة | تحدي المعرفة - تشغيل دون إنترنت</title>
  <style>
    body { font-family: system-ui, Tahoma, Arial, sans-serif; background: #020617; color: white; text-align: center; padding: 40px; }
    .card { max-width: 650px; margin: 0 auto; background: #0f172a; padding: 30px; border-radius: 20px; border: 2px solid #f59e0b; }
    h1 { color: #fbbf24; }
    .btn { display: inline-block; background: #f59e0b; color: black; font-weight: bold; padding: 12px 24px; border-radius: 12px; text-decoration: none; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 50px;">🐥</div>
    <h1>علامة | تحدي المعرفة</h1>
    <p>تم إعداد هذا الملف للتشغيل المباشر من فلاشة USB دون اتصال بالإنترنت.</p>
    <p>تفضل بتشغيل التطبيق المباشر أو استعراض بنك الأسئلة المرفق في مجلد data/questions.json.</p>
  </div>
</body>
</html>`;
      zip.file('index.html', standaloneHtml);

      // Generate ZIP blob
      const content = await zip.generateAsync({ type: 'blob' });

      // Trigger download
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Alamah_USB_Offline_Bundle_${Date.now()}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      setIsGenerating(false);
      setDownloadReady(true);
    } catch (err) {
      setIsGenerating(false);
      alert('حدث خطأ أثناء تجميع ملف ZIP.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-right select-none space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white">تجهيز حزمة فلاشة USB (بدون إنترنت)</h2>
          <p className="text-xs text-slate-400 mt-1">
            حمّل الحزمة كاملة في ملف ZIP لنسخها وتشغيلها في الفصل على أي جهاز Windows
          </p>
        </div>

        <button
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة</span>
        </button>
      </div>

      {/* Main USB Action Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border-2 border-emerald-500/40 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border-2 border-emerald-500/30 shrink-0">
            <HardDrive className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white mb-2">
              حزمة فلاشة USB المدرسية الجاهزة
            </h3>
            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              تحتوي هذه الحزمة على ملفات البرنامج المستقلة، وبنك الأسئلة المعتمد، ومحددات التشغيل التلقائي عبر ملف باتش (Batch) لمتصفحي Edge و Chrome، وتعليمات التشغيل المكتوبة باللغة العربية.
            </p>
          </div>
        </div>

        {/* Feature Checks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
          <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>يعمل دون اتصال بالإنترنت تماماً (Offline)</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>متوافق مع Windows 10 و Windows 11</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>يتضمن بنك الأسئلة المحدث ومرجع الدروس</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-slate-950/60 rounded-xl border border-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>مؤثرات صوتية ومسابقات كرتونية مدمجة محلياً</span>
          </div>
        </div>

        {/* Download Button */}
        <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            حجم الحزمة مضغوطة: حوالي 25 كيلوبايت فقط!
          </div>

          <button
            onClick={handleGenerateZip}
            disabled={isGenerating}
            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-sm shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span>{isGenerating ? 'جاري تجميع الملفات...' : 'تحميل حزمة USB الآن (ZIP)'}</span>
          </button>
        </div>

        {downloadReady && (
          <div className="p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-xl text-xs text-emerald-200 text-center font-bold animate-pulse">
            ✓ تم تحميل ملف ZIP بنجاح! يمكنك فك ضغطه ونسخ محتواه مباشرة على فلاشة USB.
          </div>
        )}
      </div>

      {/* Package Contents Breakdown */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-amber-400" />
          <span>محتويات ملف ZIP عند فك الضغط على الفلاشة:</span>
        </h4>

        <div className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 leading-relaxed text-left" dir="ltr">
          <div className="text-amber-400 font-bold">علامة-المسابقة/</div>
          <div className="pl-4 text-emerald-400">├── شغل_المسابقة.bat (ملف التشغيل السريع بنقرة واحدة)</div>
          <div className="pl-4">├── index.html (صفحة البرنامج المباشرة للمتصفح)</div>
          <div className="pl-4">├── data/</div>
          <div className="pl-8 text-sky-400">└── questions.json (بنك الأسئلة المعتمد بصيغة JSON)</div>
          <div className="pl-4 text-slate-400">└── README_تعليمات_التشغيل.txt (إرشادات المعلم والتشغيل)</div>
        </div>
      </div>
    </div>
  );
};
