import { useEffect, useState, useCallback } from 'react';
import { ArrowLeft, Users, Lock, Globe, Copy, Check, Loader2, RefreshCw, UserCheck, UserX, Play, Music2, Trash2, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { usePlayer, type Track } from '@/context/PlayerContext';
import { supabase } from '@/lib/supabase';

type Room = { id: string; name: string; description: string; creator_id: string; invite_code: string; is_discoverable: boolean; created_at: string };
type RoomMember = { room_id: string; user_id: string; status: string; invited_via: string; joined_at: string | null };
type RoomTrack = { id: string; room_id: string; track_id: string; added_by: string; added_at: string };

export function RoomDetailPage({ roomId, onBack }: { roomId: string; onBack: () => void }) {
  const { profile } = useAuth();
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();
  const [room, setRoom] = useState<Room | null>(null);
  const [members, setMembers] = useState<RoomMember[]>([]);
  const [roomTracks, setRoomTracks] = useState<RoomTrack[]>([]);
  const [trackMeta, setTrackMeta] = useState<Record<string, Track>>({});
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);

  const loadRoom = useCallback(async () => {
    const [{ data: roomData }, { data: memberData }, { data: trackData }] = await Promise.all([
      supabase.from('rooms').select('*').eq('id', roomId).maybeSingle(),
      supabase.from('room_members').select('*').eq('room_id', roomId),
      supabase.from('room_tracks').select('*').eq('room_id', roomId).order('added_at', { ascending: false }),
    ]);
    setRoom(roomData as Room | null);
    setMembers((memberData as RoomMember[]) ?? []);
    setRoomTracks((trackData as RoomTrack[]) ?? []);
    if (trackData && trackData.length > 0) {
      const trackIds = (trackData as RoomTrack[]).map((t) => t.track_id);
      const { data: tracks } = await supabase.from('tracks').select('*').in('id', trackIds);
      if (tracks) { const map: Record<string, Track> = {}; for (const t of tracks as Track[]) { map[t.id] = t; } setTrackMeta(map); }
    }
    setLoading(false);
  }, [roomId]);

  useEffect(() => { loadRoom(); }, [loadRoom]);

  const isCreator = room?.creator_id === profile?.id;
  const pendingMembers = members.filter((m) => m.status === 'pending');
  const activeMembers = members.filter((m) => m.status === 'active');

  const copyInviteLink = () => { if (!room) return; const url = `${window.location.origin}?invite=${room.invite_code}`; navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const handleRegenerate = async () => { setRegenerating(true); const { data, error } = await supabase.rpc('regenerate_invite_code', { p_room_id: roomId }); if (!error && data) { setRoom({ ...room!, invite_code: data }); } setRegenerating(false); };
  const handleApprove = async (userId: string) => { setActionUserId(userId); const { error } = await supabase.rpc('approve_room_member', { p_room_id: roomId, p_user_id: userId }); if (!error) await loadRoom(); setActionUserId(null); };
  const handleReject = async (userId: string) => { setActionUserId(userId); const { error } = await supabase.rpc('reject_room_member', { p_room_id: roomId, p_user_id: userId }); if (!error) await loadRoom(); setActionUserId(null); };
  const handleLeave = async () => { if (!profile) return; await supabase.from('room_members').delete().eq('room_id', roomId).eq('user_id', profile.id); onBack(); };
  const handleRemoveTrack = async (roomTrackId: string) => { await supabase.from('room_tracks').delete().eq('id', roomTrackId); await loadRoom(); };
  const handlePlayTrack = (track: Track) => { const roomTrackList = roomTracks.map((rt) => trackMeta[rt.track_id]).filter((t): t is Track => t !== undefined); playTrack(track, roomTrackList); };

  if (loading) { return (<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 text-groove-gray animate-spin" /></div>); }
  if (!room) { return (<div className="flex-1 flex items-center justify-center"><p className="text-sm text-groove-gray">Room not found.</p></div>); }

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button onClick={onBack} className="flex items-center gap-2 text-groove-gray hover:text-sleeve-cream transition-colors mb-6"><ArrowLeft className="w-4 h-4" /> Back to Rooms</button>
        <div className="flex items-center gap-3 mb-2">{room.is_discoverable ? <Globe className="w-6 h-6 text-white-label-acid" /> : <Lock className="w-6 h-6 text-groove-gray" />}<h1 className="text-3xl font-bold text-sleeve-cream">{room.name}</h1></div>
        {room.description && <p className="text-sm text-groove-gray mb-4">{room.description}</p>}
        <div className="bg-groove-charcoal rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2"><p className="text-xs font-mono text-groove-gray uppercase tracking-widest">Invite code</p>{isCreator && (<button onClick={handleRegenerate} disabled={regenerating} className="flex items-center gap-1 text-xs text-white-label-acid hover:text-sleeve-cream transition-colors disabled:opacity-50">{regenerating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}Regenerate</button>)}</div>
          <div className="flex items-center gap-2"><code className="flex-1 text-sm text-sleeve-cream font-mono bg-vinyl-black rounded-lg px-3 py-2 border border-groove-charcoal">{room.invite_code}</code><button onClick={copyInviteLink} className="flex-shrink-0 p-2 rounded-lg bg-white-label-acid text-vinyl-black">{copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}</button></div>
        </div>
        {isCreator && pendingMembers.length > 0 && (
          <div className="mb-6"><h2 className="text-sm font-bold text-sleeve-cream mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-white-label-acid" />Pending Approvals ({pendingMembers.length})</h2><div className="space-y-2">{pendingMembers.map((m) => (<div key={m.user_id} className="flex items-center justify-between p-3 rounded-xl bg-groove-charcoal"><p className="text-sm text-sleeve-cream">User {m.user_id.slice(0, 8)}</p><div className="flex gap-2"><button onClick={() => handleApprove(m.user_id)} disabled={actionUserId === m.user_id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold disabled:opacity-50">{actionUserId === m.user_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}Approve</button><button onClick={() => handleReject(m.user_id)} disabled={actionUserId === m.user_id} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-test-pressing-red/20 text-test-pressing-red text-xs font-bold disabled:opacity-50"><UserX className="w-3.5 h-3.5" />Reject</button></div></div>))}</div></div>
        )}
        <div className="mb-6"><h2 className="text-sm font-bold text-sleeve-cream mb-3 flex items-center gap-2"><Users className="w-4 h-4 text-groove-gray" />Members ({activeMembers.length})</h2><p className="text-sm text-groove-gray">{activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}{isCreator ? ' (you are the creator)' : ''}</p></div>
        <div className="mb-6"><h2 className="text-sm font-bold text-sleeve-cream mb-3">Tracks</h2>{roomTracks.length === 0 ? (<div className="flex flex-col items-center py-8 text-center"><Music2 className="w-10 h-10 text-groove-gray mb-3" /><p className="text-sm text-groove-gray">No tracks in this room yet.</p></div>) : (<div className="space-y-2">{roomTracks.map((rt) => { const track = trackMeta[rt.track_id]; if (!track) return null; const isCurrent = currentTrack?.id === track.id; const canRemove = isCreator || rt.added_by === profile?.id; return (<div key={rt.id} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${isCurrent ? 'bg-groove-charcoal' : 'hover:bg-groove-charcoal/50'}`}><button onClick={() => { if (isCurrent) togglePlay(); else handlePlayTrack(track); }} className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors" style={{ backgroundColor: isCurrent && isPlaying ? '#DFFF3F' : '#1B1917', color: isCurrent && isPlaying ? '#0D0C0B' : '#DFFF3F', border: '1px solid #3a3733' }}>{isCurrent && isPlaying ? <span className="text-xs font-bold">||</span> : <Play className="w-4 h-4 ml-0.5" fill="currentColor" />}</button><div className="flex-1 min-w-0"><p className="text-sm font-medium text-sleeve-cream truncate">{track.title}</p><p className="text-xs text-groove-gray truncate">{track.artist}</p></div>{canRemove && (<button onClick={() => handleRemoveTrack(rt.id)} className="flex-shrink-0 p-1.5 text-groove-gray hover:text-test-pressing-red transition-colors"><Trash2 className="w-4 h-4" /></button>)}</div>); })}</div>)}</div>
        {!isCreator && (<button onClick={handleLeave} className="flex items-center gap-2 text-sm text-test-pressing-red hover:text-test-pressing-red/80 transition-colors"><LogOut className="w-4 h-4" />Leave room</button>)}
      </div>
    </div>
  );
}
