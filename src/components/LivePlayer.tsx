import React, { useState } from 'react';
import { PhysicsClass, Recording, Language, StudyMaterial } from '../types';
import { TRANSLATIONS } from '../data/mockData';
import { Video, Play, FastForward, Bookmark, FileText, Download } from 'lucide-react';

// Reusable restricted player to disable sharing, copy links, and Watch on YouTube button clicks
export const RestrictedVideoPlayer = ({ src, title, id }: { src: string; title: string; id: string }) => {
  const isYouTube = src.includes('youtube.com') || src.includes('youtu.be');
  
  let finalSrc = src;
  if (isYouTube) {
    try {
      let videoId = '';
      if (src.includes('youtu.be/')) {
        videoId = src.split('youtu.be/')[1]?.split(/[?#]/)[0];
      } else if (src.includes('youtube.com/embed/')) {
        videoId = src.split('youtube.com/embed/')[1]?.split(/[?#]/)[0];
      } else if (src.includes('youtube.com/watch')) {
        const urlObj = new URL(src);
        videoId = urlObj.searchParams.get('v') || '';
      } else if (src.includes('youtube.com/live/')) {
        videoId = src.split('youtube.com/live/')[1]?.split(/[?#]/)[0];
      } else if (src.includes('youtube.com/shorts/')) {
        videoId = src.split('youtube.com/shorts/')[1]?.split(/[?#]/)[0];
      }

      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : src;
      const urlObj = new URL(embedUrl);
      urlObj.searchParams.set('modestbranding', '1');
      urlObj.searchParams.set('rel', '0');
      urlObj.searchParams.set('showinfo', '0');
      urlObj.searchParams.set('iv_load_policy', '3');
      urlObj.searchParams.set('fs', '1');
      urlObj.searchParams.set('disablekb', '1');
      finalSrc = urlObj.toString();
    } catch (e) {
      let videoId = '';
      if (src.includes('youtu.be/')) {
        videoId = src.split('youtu.be/')[1]?.split(/[?#]/)[0];
      }
      const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : src;
      const separator = embedUrl.includes('?') ? '&' : '?';
      finalSrc = `${embedUrl}${separator}modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=1&disablekb=1`;
    }
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <iframe
        id={id}
        className="absolute inset-0 w-full h-full border-none"
        src={finalSrc}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"
        allowFullScreen
      />
      {isYouTube && (
        <>
          {/* Top Full Overlay: covers the top bar entirely containing the Share, Watch Later, and Channel links */}
          <div 
            className="absolute top-0 left-0 w-full h-[65px] z-30 cursor-default pointer-events-auto"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
          {/* Bottom Right Overlay: covers the bottom-right corner where YouTube logo / Watch on YouTube resides, while keeping other player buttons usable */}
          <div 
            className="absolute bottom-0 right-0 w-[140px] h-[48px] z-30 cursor-default pointer-events-auto"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
          {/* Bottom Left Overlay: covers the bottom-left corner where a share icon / link icon resides */}
          <div 
            className="absolute bottom-0 left-0 w-[220px] h-[96px] z-30 cursor-default pointer-events-auto"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.01)' }}
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onMouseUp={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          />
        </>
      )}
    </div>
  );
};

interface LivePlayerProps {
  cls: PhysicsClass;
  recordings: Recording[];
  materials?: StudyMaterial[];
  lang: Language;
  studentName: string;
}

export default function LivePlayer({ cls, recordings, materials = [], lang, studentName }: LivePlayerProps) {
  const t = TRANSLATIONS[lang];
  const [activeTab, setActiveTab] = useState<'live' | 'records'>('live');
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<string>('1.0x');

  const handleJumpToBookmark = (timeInMinutes: number, label: string) => {
    alert(`Jumping video stream to [${label}] - simulated video elapsed time set to ${timeInMinutes} minutes.`);
  };

  const activeRecordings = recordings.filter(r => r.classId === cls.id);

  return (
    <div id="live-player-container" className={`grid grid-cols-1 ${activeTab === 'records' ? 'lg:grid-cols-3' : ''} gap-6`}>
      {/* Video Stream Column */}
      <div className={`${activeTab === 'records' ? 'lg:col-span-2' : 'lg:col-span-3'} flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl`}>
        {/* Toggle bar */}
        <div className="flex bg-slate-950 border-b border-slate-800 p-2 justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('live'); setSelectedRecording(null); }}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all ${
                activeTab === 'live'
                  ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
              {t.activeLiveStream}
            </button>
            <button
              onClick={() => setActiveTab('records')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all ${
                activeTab === 'records'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Video className="h-3.5 w-3.5" />
              {t.completedLive} ({activeRecordings.length})
            </button>
          </div>
          
          <div className="text-right pr-2">
            <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">
              {cls.batch} batch • {cls.type}
            </span>
          </div>
        </div>

        {/* Video Player Box */}
        <div className="relative bg-slate-950 aspect-video w-full flex items-center justify-center">
          {activeTab === 'live' ? (
            <RestrictedVideoPlayer
              id="live-stream-iframe"
              src={cls.streamUrl}
              title="NextGEN LMS Live Stream"
            />
          ) : selectedRecording ? (
            <div className="relative w-full h-full">
              <RestrictedVideoPlayer
                id="recording-playback-iframe"
                src={selectedRecording.videoUrl}
                title={selectedRecording.title[lang]}
              />
              <div className="absolute bottom-4 right-4 bg-slate-950/80 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2 text-xs font-mono text-white z-20 pointer-events-none">
                <FastForward className="h-3.5 w-3.5 text-amber-400" />
                <span>Speed: {playbackSpeed}</span>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 max-w-sm">
              <Video className="h-12 w-12 text-slate-600 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-white mb-1">
                Select a Recorded Lesson
              </h4>
              <p className="text-xs text-slate-400">
                Pick a physics class from the recording timeline to initiate interactive bookmarks playback.
              </p>
            </div>
          )}
        </div>

        {/* Selected Lesson Title details */}
        <div className="p-4 border-t border-slate-800">
          <h3 className="font-sans font-bold text-white text-base">
            {activeTab === 'live' ? cls.name[lang] : selectedRecording ? selectedRecording.title[lang] : cls.name[lang]}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {activeTab === 'live' ? t.weeklyTime + ': ' + cls.weeklySchedule[lang] : selectedRecording ? `Uploaded Date: ${selectedRecording.date} | Duration: ${selectedRecording.duration}` : t.weeklyTime + ': ' + cls.weeklySchedule[lang]}
          </p>

          {/* Bookmarks & Speeds for Recordings */}
          {activeTab === 'records' && selectedRecording && (
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-mono tracking-wider text-amber-400 uppercase font-bold flex items-center gap-1 mb-2">
                  <Bookmark className="h-3 w-3" />
                  {t.videoBookmarks}
                </span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {selectedRecording.bookmarks.map((bookmark, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleJumpToBookmark(bookmark.time, bookmark.label)}
                      className="w-full text-left text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 p-2 rounded-lg border border-slate-800 hover:border-slate-700 flex justify-between items-center transition-all"
                    >
                      <span className="font-medium truncate">{bookmark.label}</span>
                      <span className="font-mono text-amber-500 font-semibold">{bookmark.time}m</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono tracking-wider text-amber-400 uppercase font-bold flex items-center gap-1 mb-2">
                  <FastForward className="h-3 w-3" />
                  {t.speedControls}
                </span>
                <div className="grid grid-cols-5 gap-1">
                  {['0.5x', '1.0x', '1.25x', '1.5x', '2.0x'].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      className={`py-2 rounded-lg font-mono text-xs font-medium transition-all ${
                        playbackSpeed === speed
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {speed}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 mt-3 leading-relaxed">
                  Speed settings manipulate simulated HTML5 playback buffers to fast-track explanations.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Study Materials section for this unlocked class */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {lang === 'en' ? 'Class Study Materials' : 'පන්ති අධ්‍යයන ද්‍රව්‍ය'}
            </h4>
            <span className="text-[10px] bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded-lg font-mono">
              {materials.filter(m => m.classId === cls.id).length} {lang === 'en' ? 'Files' : 'ලිපිගොනු'}
            </span>
          </div>

          {materials.filter(m => m.classId === cls.id).length === 0 ? (
            <p className="text-slate-500 text-[11px] italic">
              {lang === 'en' ? 'No study materials uploaded for this class yet.' : 'මෙම පන්තිය සඳහා තවමත් අධ්‍යයන ද්‍රව්‍ය උඩුගත කර නොමැත.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {materials.filter(m => m.classId === cls.id).map((mat) => (
                <div key={mat.id} className="p-3 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-750 transition-all">
                  <div className="min-w-0 flex-1 mr-2">
                    <span className="text-[8px] bg-slate-900 text-amber-500 px-1.5 py-0.5 rounded font-mono font-bold uppercase">
                      {mat.moduleName}
                    </span>
                    <h5 className="font-semibold text-white text-[11px] mt-1 truncate" title={mat.title[lang]}>
                      {mat.title[lang]}
                    </h5>
                  </div>
                  <a
                    href={mat.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[10px] transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Download className="h-3 w-3" />
                    {lang === 'en' ? 'Download' : 'බාගත කරන්න'}
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recordings Timeline Column - Only shown when activeTab === 'records' */}
      {activeTab === 'records' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col shadow-xl overflow-hidden h-[400px] lg:h-auto">
          <div className="flex flex-col h-full">
            {/* Recordings Timeline Header */}
            <div className="bg-slate-950 p-4 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Video className="h-4 w-4 text-amber-400" />
                Select Recorded Module
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeRecordings.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No recorded video streams for this class track.
                </div>
              ) : (
                activeRecordings.map((rec) => (
                  <button
                    key={rec.id}
                    onClick={() => setSelectedRecording(rec)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex gap-3 ${
                      selectedRecording?.id === rec.id
                        ? 'bg-amber-500/10 border-amber-500/30 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="h-8 w-8 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700 text-amber-400 font-bold">
                      <Play className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-xs leading-tight truncate">
                        {rec.title[lang]}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 font-mono">
                        <span>{rec.date}</span>
                        <span>•</span>
                        <span>{rec.duration}</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}