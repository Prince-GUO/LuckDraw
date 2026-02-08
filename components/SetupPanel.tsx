import React, { useState } from 'react';
import { Member, Award } from '../types';
import { Upload, Users, Award as AwardIcon, Image as ImageIcon, Music, Play, X, Plus, Volume2, Square, Trash2, Maximize2 } from 'lucide-react';
import * as XLSX from 'xlsx';

interface Props {
  members: Member[];
  setMembers: (m: Member[]) => void;
  awards: Award[];
  setAwards: (a: Award[]) => void;
  bgImage: string | null;
  setBgImage: (url: string | null) => void;
  bgMusic: string | null;
  setBgMusic: (url: string | null) => void;
  onStart: () => void;
}

export const SetupPanel: React.FC<Props> = ({ 
  members, setMembers, awards, setAwards, 
  bgImage, setBgImage, bgMusic, setBgMusic, onStart 
}) => {
  const [pasteText, setPasteText] = useState('');
  const [activeTab, setActiveTab] = useState<'members' | 'awards' | 'settings'>('members');
  const [isTestPlaying, setIsTestPlaying] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json<any>(worksheet);
      
      const newMembers: Member[] = data.map((item, index) => ({
        id: `excel-${index}-${Date.now()}`,
        name: item.姓名 || item.name || item.Name || String(Object.values(item)[0]),
        department: item.部门 || item.dept || ''
      })).filter(m => m.name);
      
      setMembers([...members, ...newMembers]);
    };
    reader.readAsBinaryString(file);
  };

  const handlePasteImport = () => {
    const lines = pasteText.split('\n').filter(line => line.trim());
    const newMembers: Member[] = lines.map((name, index) => ({
      id: `paste-${index}-${Date.now()}`,
      name: name.trim()
    }));
    setMembers([...members, ...newMembers]);
    setPasteText('');
  };

  const addAward = () => {
    setAwards([...awards, { id: Date.now().toString(), name: '新奖项', count: 1, winners: [] }]);
  };

  const updateAward = (id: string, updates: Partial<Award>) => {
    setAwards(awards.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const removeAward = (id: string, name: string) => {
    if (window.confirm(`确定要删除奖项 "${name}" 吗？`)) {
      setAwards(awards.filter(a => a.id !== id));
    }
  };

  const handleImageUpload = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateAward(id, { image: ev.target?.result as string });
      reader.readAsDataURL(file);
    }
  };

  const removeAwardImage = (id: string) => {
    updateAward(id, { image: undefined });
  };

  return (
    <div className="max-w-4xl mx-auto mt-44 mb-16 p-8 bg-red-950/40 backdrop-blur-xl rounded-3xl border border-red-500/30 shadow-2xl relative z-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold font-chinese bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">
          年会抽奖系统后台配置
        </h1>
        <button 
          onClick={onStart}
          className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full font-bold text-white hover:scale-105 transition-transform shadow-lg shadow-orange-900/40"
        >
          <Play size={20} /> 进入抽奖现场
        </button>
      </div>

      <div className="flex gap-4 mb-6 border-b border-red-500/20">
        <button onClick={() => setActiveTab('members')} className={`pb-3 px-4 flex items-center gap-2 transition-colors ${activeTab === 'members' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-gray-200'}`}><Users size={16}/> 名单录入</button>
        <button onClick={() => setActiveTab('awards')} className={`pb-3 px-4 flex items-center gap-2 transition-colors ${activeTab === 'awards' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-gray-200'}`}><AwardIcon size={16}/> 奖项设置</button>
        <button onClick={() => setActiveTab('settings')} className={`pb-3 px-4 flex items-center gap-2 transition-colors ${activeTab === 'settings' ? 'border-b-2 border-yellow-500 text-yellow-500' : 'text-gray-400 hover:text-gray-200'}`}><ImageIcon size={16}/> 背景与音乐</button>
      </div>

      <div className="h-[500px] overflow-y-auto pr-4 scrollbar-hide">
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 bg-red-900/20 rounded-2xl border border-red-500/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500/80"><Upload size={18} /> Excel 导入</h3>
                <input type="file" accept=".xlsx, .xls" onChange={handleExcelImport} className="hidden" id="excel-input" />
                <label htmlFor="excel-input" className="cursor-pointer block w-full py-10 border-2 border-dashed border-red-500/30 rounded-xl text-center hover:bg-red-500/10 transition-colors group">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="text-red-500 group-hover:scale-110 transition-transform" size={32} />
                    <p className="text-gray-400">点击上传抽奖名单 Excel</p>
                    <p className="text-xs text-gray-500">支持姓名、部门列</p>
                  </div>
                </label>
              </div>
              <div className="p-6 bg-red-900/20 rounded-2xl border border-red-500/10">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-yellow-500/80"><Plus size={18} /> 快捷粘贴</h3>
                <textarea 
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="请输入员工姓名，每行一个..."
                  className="w-full h-24 bg-red-950/50 border border-red-500/20 rounded-xl p-3 text-sm focus:outline-none focus:border-yellow-500 resize-none transition-colors"
                />
                <button onClick={handlePasteImport} className="mt-2 w-full py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors font-medium">确认添加名单</button>
              </div>
            </div>
            <div className="p-6 bg-red-900/10 rounded-2xl border border-red-500/5">
              <h3 className="text-lg font-bold mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2 text-red-200"><Users size={18} /> 已录入名单 ({members.length} 人)</span>
                <button onClick={() => setMembers([])} className="text-xs text-red-400 hover:text-red-300 px-2 py-1 bg-red-500/10 rounded hover:bg-red-500/20">清空全部</button>
              </h3>
              <div className="flex flex-wrap gap-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                {members.length === 0 ? (
                    <div className="w-full text-center py-8 text-gray-600 italic">暂无人员名单</div>
                ) : (
                    members.map(m => (
                    <span key={m.id} className="px-3 py-1 bg-red-800/20 rounded-full text-sm border border-red-500/10 text-red-100/70">
                        {m.name}
                    </span>
                    ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'awards' && (
          <div className="space-y-4">
            {awards.map((award, index) => (
              <div key={award.id} className="p-5 bg-red-900/20 rounded-2xl border border-red-500/10 flex items-center gap-6 group hover:border-red-500/30 transition-all">
                <div className="w-24 h-24 bg-red-800/40 rounded-2xl flex items-center justify-center overflow-hidden border border-red-500/20 relative group-hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all">
                  {award.image ? (
                    <div className="relative w-full h-full group/img">
                      <img 
                        src={award.image} 
                        className="w-full h-full object-cover animate-fade-in" 
                        alt={award.name}
                      />
                      
                      {/* 悬浮操作层 */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <button 
                          onClick={() => setEnlargedImage(award.image!)}
                          className="p-1.5 bg-yellow-500/80 rounded-full text-red-900 hover:bg-yellow-400 transition-colors"
                          title="放大预览"
                        >
                          <Maximize2 size={16} />
                        </button>
                        <button 
                          onClick={() => removeAwardImage(award.id)}
                          className="p-1.5 bg-red-600/80 rounded-full text-white hover:bg-red-500 transition-colors"
                          title="删除图片"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-red-500/10 transition-colors gap-1">
                      <ImageIcon className="text-red-500/40" size={28} />
                      <span className="text-[10px] text-red-500/60 font-bold uppercase">上传奖品图</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(award.id, e)} 
                      />
                    </label>
                  )}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-xs text-red-500/60 font-bold uppercase tracking-wider">奖项名称</label>
                    <input 
                      value={award.name} 
                      onChange={e => updateAward(award.id, { name: e.target.value })}
                      className="w-full bg-transparent border-b border-red-500/30 focus:border-yellow-500 outline-none p-1 text-xl font-chinese text-yellow-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-red-500/60 font-bold uppercase tracking-wider">抽取人数</label>
                    <div className="flex items-center gap-3">
                        <input 
                        type="number"
                        min="1"
                        value={award.count}
                        onChange={e => updateAward(award.id, { count: parseInt(e.target.value) || 0 })}
                        className="w-20 bg-red-950/50 rounded-lg p-2 text-center outline-none border border-red-500/20 focus:border-yellow-500 font-bold text-yellow-500"
                        />
                        <span className="text-gray-500 text-sm">人</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => removeAward(award.id, award.name)} 
                  className="p-3 text-red-500 hover:bg-red-500/20 rounded-full transition-colors group/del"
                  title="删除奖项"
                >
                  <Trash2 size={20} className="group-hover/del:scale-110 transition-transform" />
                </button>
              </div>
            ))}
            <button onClick={addAward} className="w-full py-5 border-2 border-dashed border-red-500/30 rounded-2xl flex items-center justify-center gap-3 text-gray-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all font-bold">
              <Plus size={24} /> 添加新奖项层级
            </button>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8 pb-4">
            <div className="grid grid-cols-2 gap-8">
              {/* Background Image Setting */}
              <div className="p-6 bg-red-900/20 rounded-3xl border border-red-500/10 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-yellow-500/80"><ImageIcon size={18} /> 自定义背景图</h3>
                    <button onClick={() => setBgImage(null)} className="text-xs text-red-400 hover:underline">重置默认</button>
                </div>
                <div className="w-full aspect-video bg-red-950/60 rounded-xl border border-red-500/20 relative overflow-hidden group mb-4">
                    {bgImage ? (
                        <img src={bgImage} className="w-full h-full object-cover animate-fade-in" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-700 italic text-sm">默认动态红色背景</div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity gap-2">
                        <Upload size={24} className="text-yellow-500" />
                        <span className="text-sm font-bold">点击上传新背景</span>
                        <input type="file" accept="image/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => setBgImage(ev.target?.result as string);
                                reader.readAsDataURL(file);
                            }
                        }} className="hidden" />
                    </label>
                </div>
                <p className="text-xs text-gray-500 text-center">建议分辨率 1920x1080 以上，支持 jpg/png/webp</p>
              </div>

              {/* Background Music Setting */}
              <div className="p-6 bg-red-900/20 rounded-3xl border border-red-500/10 flex flex-col items-center">
                <div className="w-full flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-2 text-yellow-500/80"><Music size={18} /> 现场背景音乐</h3>
                    <button onClick={() => setBgMusic(null)} className="text-xs text-red-400 hover:underline">重置默认</button>
                </div>
                <div className="w-full flex-1 bg-red-950/60 rounded-xl border border-red-500/20 p-6 flex flex-col items-center justify-center gap-4 relative group">
                    <div className={`p-6 rounded-full ${bgMusic ? 'bg-yellow-500/20 text-yellow-500' : 'bg-red-500/10 text-red-500/30'}`}>
                        <Music size={48} className={bgMusic ? 'animate-bounce' : ''} />
                    </div>
                    {bgMusic && (
                        <div className="text-center">
                            <p className="text-sm text-yellow-200 font-bold mb-3 truncate max-w-[200px]">已上传自定义音频</p>
                            <button 
                                onClick={() => setIsTestPlaying(!isTestPlaying)}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-red-900 rounded-full font-bold text-sm hover:scale-105 transition-transform"
                            >
                                {isTestPlaying ? <><Square size={14} fill="currentColor"/> 停止播放</> : <><Volume2 size={14}/> 试听音乐</>}
                            </button>
                        </div>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity gap-2 rounded-xl">
                        <Upload size={24} className="text-yellow-500" />
                        <span className="text-sm font-bold">上传 MP3/WAV 音频</span>
                        <input type="file" accept="audio/*" onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                    setBgMusic(ev.target?.result as string);
                                    setIsTestPlaying(false);
                                };
                                reader.readAsDataURL(file);
                            }
                        }} className="hidden" />
                    </label>
                </div>
                {isTestPlaying && bgMusic && (
                    <audio src={bgMusic} autoPlay onEnded={() => setIsTestPlaying(false)} className="hidden" />
                )}
                <p className="text-xs text-gray-500 text-center mt-4">上传后将作为全场背景乐循环播放</p>
              </div>
            </div>

            <div className="p-8 text-center bg-yellow-500/5 rounded-2xl border border-yellow-500/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-yellow-500/20 rotate-12">🧧</div>
              <div className="absolute bottom-0 left-0 p-2 text-yellow-500/20 -rotate-12">🐎</div>
              <p className="text-yellow-600 font-chinese text-2xl tracking-widest">龙马精神 · 万事如意 · 马到成功</p>
              <p className="text-gray-600 mt-2 text-xs uppercase tracking-tighter">Powered by Annual Lucky Draw System © 2026</p>
            </div>
          </div>
        )}
      </div>

      {/* 图片放大预览模态框 */}
      {enlargedImage && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setEnlargedImage(null)} />
          <div className="relative max-w-4xl max-h-[80vh] bg-white p-2 rounded-xl shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in duration-300">
            <img src={enlargedImage} className="w-full h-full object-contain rounded-lg animate-fade-in" alt="预览" />
            <button 
              onClick={() => setEnlargedImage(null)}
              className="absolute -top-4 -right-4 bg-red-600 text-white p-2 rounded-full hover:bg-red-500 transition-colors shadow-xl"
            >
              <X size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
