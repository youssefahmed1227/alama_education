/**
 * Teacher Guide & Curriculum Documentation Component («دليل المعلم»)
 * Pedagogical notes, 3rd Prep Social Studies syllabus breakdown, and offline USB run instructions
 */

import React from 'react';
import { BookOpen, CheckCircle, HelpCircle, HardDrive, Award, Sparkles, ArrowRight } from 'lucide-react';

interface TeacherGuideModalProps {
  onBack: () => void;
}

export const TeacherGuideModal: React.FC<TeacherGuideModalProps> = ({ onBack }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-right space-y-8 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white">دليل المعلم والمسابقات الصفية</h2>
          <p className="text-xs text-slate-400 mt-1">
            منهج الدراسات الاجتماعية - الصف الثالث الإعدادي - الفصل الدراسي الأول (2026-2027)
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

      {/* Curriculum Verification Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">
            محتوى موضوع البداية: الوحدة الثانية (الدرس الأول: السلالات البشرية في العالم)
          </h3>
        </div>

        <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
          تمت مطابقة أسئلة هذا الدرس بعناية مع كتاب الوزارة المعتمد لمادة الدراسات الاجتماعية، وتغطي المحاور الآتية:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400">1. السلالة الزنجية (10%)</h4>
            <p className="text-slate-400 leading-relaxed">
              البشرة الداكنة، الأنف العريض، الشعر الأجعد، والشفاه الغليظة. أقسامها: الزنوج السودانيون، البانتو، النيليون الحاميون، الأقزام، البوشمن والهوتنتوت، والأستراليون الأصليون.
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400">2. السلالة المغولية (40%)</h4>
            <p className="text-slate-400 leading-relaxed">
              البشرة الصفراء، العيون المنحرفة (الضيقة)، والشعر الأسود المسترسل. أقسامها: الإسكيمو (شمال كندا وألاسكا)، الهنود الحمر (الأمريكتان)، وجماعة التنجس (سيبيريا).
            </p>
          </div>

          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
            <h4 className="font-bold text-amber-400">3. السلالة القوقازية (50%)</h4>
            <p className="text-slate-400 leading-relaxed">
              البشرة البيضاء الوردية والشعر المتموج والشفاه الرفيعة. أقسامها: سكان حوض البحر المتوسط (العرب وجنوب أوروبا)، المجموعة الألبية (غرب ووسط أوروبا)، والمجموعة النوردية الشمالية.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-amber-400/10 border border-amber-400/30 rounded-xl text-xs text-amber-200 leading-relaxed">
          <strong className="font-bold">قاعدة علمية وإنسانية أساسية في المنهج:</strong> لا توجد سلالة نقية تماماً اليوم إلا في بعض المجتمعات البدائية المنعزلة (مثل سكان حوض الكونغو وصحراء كالهاري، والإسكيمو، والهنود الحمر). تقسيم السلالات ظاهري فقط وليس جوهرياً (لا توجد سلالة أذكى من سلالة أو أكثر قدرة على العمل والإنتاج).
        </div>
      </div>

      {/* Classroom Competition Rules */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-sky-400" />
          <h3 className="text-lg font-bold text-white">إرشادات إدارة المسابقة داخل الفصل المدرسي</h3>
        </div>

        <div className="space-y-3 text-xs md:text-sm text-slate-300">
          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              1
            </span>
            <p>
              <strong>عرض شاشة المسابقة على شاشة الفصل الذكية أو جهاز العرض (Data Show):</strong> تم تصميم الخطوط والألوان بدرجات داكنة متباينة لتكون مقروءة بوضوح لجميع الطلاب من مسافة.
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              2
            </span>
            <p>
              <strong>نظام الفريقين التفاعلي:</strong> قسّم طلاب الفصل إلى فريقين متوازنين، وأدخل أسماء ممثلي الفريقين (مثلاً: «الفرسان» ضد «الرواد» أو بأسماء الطلاب كـ «يوسف» و«أحمد»).
            </p>
          </div>

          <div className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-slate-800 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
              3
            </span>
            <p>
              <strong>استثمار المؤقت والمؤثرات الكرتونية:</strong> وجود المؤقت وشخصية الكتكوت المرحة يزرعان الحماس والتفاعل الإيجابي ويزيلان رهبة الاختبارات.
            </p>
          </div>
        </div>
      </div>

      {/* Offline USB Operation Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-bold text-white">التشغيل دون إنترنت والنسخ على فلاشة USB</h3>
        </div>

        <div className="text-xs text-slate-300 space-y-2 leading-relaxed">
          <p>
            هذا البرنامج مبرمج ليعمل بدون اتصال بالإنترنت نهائياً:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-400 mr-2">
            <li>لا يحتاج لأي ملفات CDN أو اتصالات خارجية.</li>
            <li>المؤثرات الصوتية تصدر مباشرة من المعالج عبر محرك الويب الصوتي المحلي.</li>
            <li>البيانات وبنك الأسئلة وسجل الجولات تحفظ محلياً على المتصفح.</li>
            <li>يمكن نسخ مجلد البرنامج أو تحميل حزمة USB وتشغيله فوراً بمتصفح Microsoft Edge أو Google Chrome على Windows 10 وWindows 11.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
