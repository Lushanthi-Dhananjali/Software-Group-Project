import React, { useState, useEffect } from 'react';
import { HomeContentSettings, Language, Milestone, CenterLocation } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { 
  Edit3, 
  Check, 
  Save, 
  Play, 
  Plus, 
  Trash2, 
  Globe, 
  Phone, 
  Clock, 
  MapPin, 
  CreditCard, 
  Layout, 
  Layers, 
  Eye 
} from 'lucide-react';

interface AdminHomepageEditorProps {
  lang: Language;
  initialContent: HomeContentSettings;
  onSave: (updatedContent: HomeContentSettings) => Promise<void>;
}

export default function AdminHomepageEditor({ lang, initialContent, onSave }: AdminHomepageEditorProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'hero' | 'milestones' | 'contact' | 'centers' | 'deposit'>('hero');

  // Hero welcome title and tagline fields
  /* To restore: 
     heroWelcomeTitleEn: "Sandun K. Dissanayaka",
     heroWelcomeTitleSi: "සඳුන් කේ. දිසානායක",
     heroTaglineEn: "The lovely commentator in cyberspace who teaches psychology to the heart",
     heroTaglineSi: "හදවතට Physics කියාදෙන cyber අවකාශයේ සොඳුරු විචාරකයා"
  */
  const [heroWelcomeTitleEn, setHeroWelcomeTitleEn] = useState(initialContent.heroWelcomeTitleEn || "Dr. Aritha Perera");
  const [heroWelcomeTitleSi, setHeroWelcomeTitleSi] = useState(initialContent.heroWelcomeTitleSi || "ආචාර්ය අරිත පෙරේරා");
  const [heroTaglineEn, setHeroTaglineEn] = useState(initialContent.heroTaglineEn || "A visionary educator inspiring students to master academic concepts with deep scientific thinking");
  const [heroTaglineSi, setHeroTaglineSi] = useState(initialContent.heroTaglineSi || "ගැඹුරු විද්‍යාත්මක චින්තනයෙන් යුතුව විශිෂ්ටතම ප්‍රතිඵල කරා සිසුන් මෙහෙයවන ප්‍රමුඛතම දේශකයා");

  // Hero section fields
  const [heroTitleEn, setHeroTitleEn] = useState(initialContent.heroTitleEn);
  const [heroTitleSi, setHeroTitleSi] = useState(initialContent.heroTitleSi);
  const [heroSubtitleEn, setHeroSubtitleEn] = useState(initialContent.heroSubtitleEn);
  const [heroSubtitleSi, setHeroSubtitleSi] = useState(initialContent.heroSubtitleSi);
  const [heroVideoUrl, setHeroVideoUrl] = useState(initialContent.heroVideoUrl);

  // Milestones (Timeline)
  const [milestones, setMilestones] = useState<Milestone[]>(initialContent.milestones);
  
  // Helpline fields
  const [helplinePhone, setHelplinePhone] = useState(initialContent.helplinePhone);
  const [helplineWhatsapp, setHelplineWhatsapp] = useState(initialContent.helplineWhatsapp);
  const [helplineHours, setHelplineHours] = useState(initialContent.helplineHours);

  // Physical tuition centers
  const [centers, setCenters] = useState<CenterLocation[]>(initialContent.centers);

  // Cash deposits slip protocols
  const [bankProtocolEn, setBankProtocolEn] = useState(initialContent.bankProtocolEn);
  const [bankProtocolSi, setBankProtocolSi] = useState(initialContent.bankProtocolSi);

  // Policy section visibility
  const [showPolicies, setShowPolicies] = useState(initialContent.showPolicies !== false);

  // Loading/Saving states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if initialContent changes
  useEffect(() => {
    setHeroWelcomeTitleEn(initialContent.heroWelcomeTitleEn || "Dr. Aritha Perera");
    setHeroWelcomeTitleSi(initialContent.heroWelcomeTitleSi || "ආචාර්ය අරිත පෙරේරා");
    setHeroTaglineEn(initialContent.heroTaglineEn || "A visionary educator inspiring students to master academic concepts with deep scientific thinking");
    setHeroTaglineSi(initialContent.heroTaglineSi || "ගැඹුරු විද්‍යාත්මක චින්තනයෙන් යුතුව විශිෂ්ටතම ප්‍රතිඵල කරා සිසුන් මෙහෙයවන ප්‍රමුඛතම දේශකයා");
    setHeroTitleEn(initialContent.heroTitleEn);
    setHeroTitleSi(initialContent.heroTitleSi);
    setHeroSubtitleEn(initialContent.heroSubtitleEn);
    setHeroSubtitleSi(initialContent.heroSubtitleSi);
    setHeroVideoUrl(initialContent.heroVideoUrl);
    setMilestones(initialContent.milestones);
    setHelplinePhone(initialContent.helplinePhone);
    setHelplineWhatsapp(initialContent.helplineWhatsapp);
    setHelplineHours(initialContent.helplineHours);
    setCenters(initialContent.centers);
    setBankProtocolEn(initialContent.bankProtocolEn);
    setBankProtocolSi(initialContent.bankProtocolSi);
    setShowPolicies(initialContent.showPolicies !== false);
  }, [initialContent]);

  // Handle saving
  const handleSaveAll = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const updated: HomeContentSettings = {
        id: "home_content",
        heroWelcomeTitleEn,
        heroWelcomeTitleSi,
        heroTaglineEn,
        heroTaglineSi,
        heroTitleEn,
        heroTitleSi,
        heroSubtitleEn,
        heroSubtitleSi,
        heroVideoUrl,
        milestones,
        helplinePhone,
        helplineWhatsapp,
        helplineHours,
        centers,
        bankProtocolEn,
        bankProtocolSi,
        showPolicies
      };
      await onSave(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error("Error saving homepage content:", err);
      alert("Failed to save homepage modifications. Please retry.");
    } finally {
      setSaving(false);
    }
  };

  // Milestone helpers
  const handleMilestoneChange = (index: number, field: keyof Milestone, value: string) => {
    const updated = [...milestones];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setMilestones(updated);
  };

  const addMilestone = () => {
    const newPhaseNo = milestones.length + 1;
    const newMilestone: Milestone = {
      phase: `Phase 0${newPhaseNo}`,
      titleEn: "New Dynamic Pathway Title",
      titleSi: "නව විෂය පථය",
      months: "Months Range",
      topics: "Topic lists or sub-modules description goes here..."
    };
    setMilestones([...milestones, newMilestone]);
  };

  const removeMilestone = (index: number) => {
    const updated = milestones.filter((_, i) => i !== index);
    // Auto re-index phase names
    const reindexed = updated.map((m, i) => ({
      ...m,
      phase: `Phase 0${i + 1}`
    }));
    setMilestones(reindexed);
  };

  // Center helpers
  const handleCenterChange = (index: number, field: keyof CenterLocation, value: string) => {
    const updated = [...centers];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setCenters(updated);
  };

  const addCenter = () => {
    setCenters([...centers, { name: "New Center Name", address: "Physical branch location coordinate" }]);
  };

  const removeCenter = (index: number) => {
    setCenters(centers.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      
      {/* Tab Header & Title */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Layout className="h-5 w-5 text-amber-500" />
            <h3 className="font-display font-black text-white text-lg uppercase tracking-tight">
              Homepage Manual Editor Panel
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manually override titles, custom descriptions, promotional video parameters, timeline phases, bank protocols, and helplines instantly.
          </p>
        </div>

        {/* Global Save Button */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          {saveSuccess && (
            <span className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-3 py-1.5 border border-emerald-500/20 rounded-lg animate-pulse">
              <Check className="h-3.5 w-3.5" /> Homepage saved successfully!
            </span>
          )}

          <button
            onClick={handleSaveAll}
            disabled={saving}
            className={`w-full lg:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-800 disabled:cursor-wait text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer`}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Synchronizing to Cloud...' : 'Commit Settings to Public Page'}
          </button>
        </div>
      </div>

      {/* Editor sub-navigation bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800/50 pb-3">
        {[
          { id: 'hero', label: '1. Hero Header & Video', icon: Globe },
          { id: 'milestones', label: '2. Syllabus Timeline', icon: Layers },
          { id: 'contact', label: '3. Office Helplines', icon: Phone },
          { id: 'centers', label: '4. Physical Centers', icon: MapPin },
          { id: 'deposit', label: '5. Slip deposits protocol', icon: CreditCard }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-2 rounded-lg text-xs font-bold tracking-tight flex items-center gap-1.5 transition-all border ${
                activeTab === tab.id
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  : 'bg-slate-950/40 text-slate-400 border-slate-800/40 hover:text-slate-200'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* EDITOR WORK AREA CONTAINER */}
      <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-5 space-y-6">
        
        {/* TAB 1: HERO CONTAINER */}
        {activeTab === 'hero' && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 text-[11px] text-amber-400/80 leading-relaxed font-mono flex items-start gap-2">
              <Eye className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                <strong>PRO TIP:</strong> Committing changes here instantly updates the main public-facing banner on the home tab, supporting both English and Sinhala toggle states dynamically.
              </span>
            </div>

            {/* PERSONALIZED WELCOME HEADER SECTION */}
            <div className="border border-slate-850 bg-slate-900/10 rounded-xl p-4 space-y-4">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono text-amber-400/90">Main Hero Greeting Card & Subtitle Tagline</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Hero Welcome Title (English)
                  </label>
                  <input
                    type="text"
                    value={heroWelcomeTitleEn}
                    onChange={(e) => setHeroWelcomeTitleEn(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-sans"
                    placeholder="Sandun K. Dissanayaka"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Hero Welcome Title (Sinhala / සිංහල)
                  </label>
                  <input
                    type="text"
                    value={heroWelcomeTitleSi}
                    onChange={(e) => setHeroWelcomeTitleSi(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-sans"
                    placeholder="සඳුන් කේ. දිසානායක"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Hero Tagline Subtitle (English)
                  </label>
                  <textarea
                    value={heroTaglineEn}
                    onChange={(e) => setHeroTaglineEn(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-sans resize-y"
                    placeholder="The lovely commentator in cyberspace who teaches psychology to the heart"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                    Hero Tagline Subtitle (Sinhala / සිංහල)
                  </label>
                  <textarea
                    value={heroTaglineSi}
                    onChange={(e) => setHeroTaglineSi(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-sans resize-y"
                    placeholder="හදවතට Physics කියාදෙන cyber අවකාශයේ සොඳුරු විචාරකයා"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-850/80 my-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Hero Welcome Title (English)
                </label>
                <input
                  type="text"
                  value={heroTitleEn}
                  onChange={(e) => setHeroTitleEn(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors"
                  placeholder="Master A/L Physics with Precision"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Hero Welcome Title (Sinhala / සිංහල)
                </label>
                <input
                  type="text"
                  value={heroTitleSi}
                  onChange={(e) => setHeroTitleSi(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors"
                  placeholder="නිරවද්‍යතාවයෙන් භෞතික විද්‍යාව ජය ගන්න"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Hero Tagline Subtitle (English)
              </label>
              <textarea
                value={heroSubtitleEn}
                onChange={(e) => setHeroSubtitleEn(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-sans resize-y"
                placeholder="English description shown on landing page..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                Hero Tagline Subtitle (Sinhala / සිංහල)
              </label>
              <textarea
                value={heroSubtitleSi}
                onChange={(e) => setHeroSubtitleSi(e.target.value)}
                rows={3}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-sans resize-y"
                placeholder="සිංහලෙන් විස්තරය..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block flex items-center gap-1">
                <Play className="h-3 w-3 text-amber-500 fill-amber-500" />
                Promo Welcome YouTube Embed Link
              </label>
              <input
                type="text"
                value={heroVideoUrl}
                onChange={(e) => setHeroVideoUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-mono"
                placeholder="https://www.youtube.com/embed/dQw4w9WgXcQ"
              />
              <span className="text-[9px] text-slate-500 block">
                Must be an embeddable YouTube URL structure (containing `/embed/`). Default: `https://www.youtube.com/embed/dQw4w9WgXcQ`
              </span>
            </div>

            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h5 className="text-xs font-bold text-slate-200">Legal Document Sections Visibility</h5>
              <label className="flex items-start gap-3 bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl cursor-pointer hover:bg-slate-850/60 transition-colors">
                <input
                  type="checkbox"
                  checked={showPolicies}
                  onChange={(e) => setShowPolicies(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-950 text-amber-500 focus:ring-amber-500 focus:ring-offset-slate-900 h-4 w-4 mt-0.5"
                />
                <div>
                  <p className="text-xs font-bold text-slate-200">Show Legal Policies on Public Homepage</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Toggle whether the Refund & Cancellation, Privacy Policy, and Terms & Conditions panels should be visible to users at the bottom of the public gateway homepage.</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 2: MILESTONES (TIMELINE) */}
        {activeTab === 'milestones' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-center pb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Chronological Curriculum Target Target</h4>
                <p className="text-[10px] text-slate-500">Add, edit, or remove timeline tracks for structured syllabus completion.</p>
              </div>
              <button
                type="button"
                onClick={addMilestone}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                New Milestone Phase
              </button>
            </div>

            <div className="space-y-4">
              {milestones.map((mile, index) => (
                <div key={index} className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 space-y-4 shadow-md relative">
                  
                  {/* Delete Badge */}
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors p-1"
                    title="Delete milestone"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-slate-950 text-amber-500 text-[10px] font-mono font-bold rounded border border-slate-800">
                      {mile.phase}
                    </span>
                    <input
                      type="text"
                      value={mile.phase}
                      onChange={(e) => handleMilestoneChange(index, 'phase', e.target.value)}
                      className="bg-transparent border-b border-transparent hover:border-slate-800 focus:border-amber-500 text-slate-400 text-xs font-semibold focus:outline-none px-1 font-mono w-28"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[9px] font-mono uppercase text-slate-500 font-bold">Months Window</label>
                      <input
                        type="text"
                        value={mile.months}
                        onChange={(e) => handleMilestoneChange(index, 'months', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        placeholder="e.g., June - Sept"
                      />
                    </div>

                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[9px] font-mono uppercase text-slate-500 font-bold">Pathway Name (English)</label>
                      <input
                        type="text"
                        value={mile.titleEn}
                        onChange={(e) => handleMilestoneChange(index, 'titleEn', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        placeholder="e.g. Classical Newtonian Mechanics"
                      />
                    </div>

                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[9px] font-mono uppercase text-slate-500 font-bold">Pathway Name (Sinhala)</label>
                      <input
                        type="text"
                        value={mile.titleSi}
                        onChange={(e) => handleMilestoneChange(index, 'titleSi', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                        placeholder="සිංහල නම..."
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-mono uppercase text-slate-500 font-bold block">Syllabus Sub-Topics Covered</label>
                    <input
                      type="text"
                      value={mile.topics}
                      onChange={(e) => handleMilestoneChange(index, 'topics', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none"
                      placeholder="e.g. Vectors, Circular Motion, Friction Equilibrium, Energy laws"
                    />
                  </div>

                </div>
              ))}

              {milestones.length === 0 && (
                <div className="text-center py-8 bg-slate-900 border border-slate-800 rounded-xl text-slate-500 text-xs">
                  No syllabus milestones registered. Click "New Milestone" above to populate list.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: CONTACT HELPLINES */}
        {activeTab === 'contact' && (
          <div className="space-y-4 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-200">Contact Coordinates & Operations Helplines</h4>
            <p className="text-[10px] text-slate-500">Provide direct communication links shown to physical and virtual LMS visitors on landing pages.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Main Office Coordinates Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={helplinePhone}
                    onChange={(e) => setHelplinePhone(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors"
                    placeholder="+94 11 259 8810"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  WhatsApp Support Helpline Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={helplineWhatsapp}
                    onChange={(e) => setHelplineWhatsapp(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors"
                    placeholder="+94 77 123 4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Operations Help Hours Description
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={helplineHours}
                    onChange={(e) => setHelplineHours(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl pl-9 pr-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors"
                    placeholder="Every Day: 8:00 AM - 8:00 PM"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: PHYSICAL CENTERS */}
        {activeTab === 'centers' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex justify-between items-center pb-2">
              <div>
                <h4 className="text-xs font-bold text-slate-200">Physical Tuition Halls & Audio Auditoriums</h4>
                <p className="text-[10px] text-slate-500">Configure physical branch locations listed in the Contact section.</p>
              </div>
              <button
                type="button"
                onClick={addCenter}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Physical Center
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {centers.map((center, idx) => (
                <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow relative">
                  
                  {/* Delete Center */}
                  <button
                    type="button"
                    onClick={() => removeCenter(idx)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-red-400 transition-colors"
                    title="Remove location"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase font-bold block">Tuition Venue Name</label>
                    <input
                      type="text"
                      value={center.name}
                      onChange={(e) => handleCenterChange(idx, 'name', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none font-bold"
                      placeholder="e.g. Colombo Physical Auditorium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-slate-500 uppercase font-bold block">Physical Address Coords</label>
                    <input
                      type="text"
                      value={center.address}
                      onChange={(e) => handleCenterChange(idx, 'address', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 focus:border-amber-500/50 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none"
                      placeholder="e.g. Nugegoda Hall complex, Sri Lanka"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: DEPOSIT SLIP PROTOCOL */}
        {activeTab === 'deposit' && (
          <div className="space-y-5 animate-fade-in">
            <h4 className="text-xs font-bold text-slate-200">Cash Deposit Slip Submission Guidelines</h4>
            <p className="text-[10px] text-slate-500">Provide direct step-by-step guidance on bank deposits shown in the cash slip panel.</p>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Instructional Text (English)
                </label>
                <textarea
                  value={bankProtocolEn}
                  onChange={(e) => setBankProtocolEn(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-sans resize-y leading-relaxed"
                  placeholder="Students depositing fees via direct physical bank cash deposits should..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold block">
                  Instructional Text (Sinhala / සිංහල)
                </label>
                <textarea
                  value={bankProtocolSi}
                  onChange={(e) => setBankProtocolSi(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none transition-colors font-sans resize-y leading-relaxed"
                  placeholder="සෘජුවම බැංකු තැන්පතු මඟින්..."
                />
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
