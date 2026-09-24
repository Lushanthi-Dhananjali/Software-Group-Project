import { User, Language } from '../types';

export default function StudentDigitalID({ user }: { user: User; lang: Language }) {
  return <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white"><p className="text-xs text-amber-500">Digital Student ID</p><h3 className="mt-2 text-xl font-bold">{user.name}</h3><p className="mt-3 text-xs text-slate-400">{user.indexNo} | {user.batch} | {user.status}</p></section>;
}