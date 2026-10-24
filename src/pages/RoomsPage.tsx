import { useEffect, useState, useCallback, useRef } from 'react';
import { Plus, Users, Lock, Globe, Loader2, Copy, Check, ArrowLeft, Music2, ArrowRight, Clock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

type Room = { id: string; name: string; description: string; creator_id: string; invite_code: string; is_discoverable: boolean; created_at: string };
type RoomMember = { room_id: string; user_id: string; status: string; invited_via: string; joined_at: string | null };

export function RoomsPage({ onSelectRoom, initialInviteCode }: { onSelectRoom: (roomId: string) => void; initialInviteCode?: string | null }) {
  const { profile } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myMemberships, setMyMemberships] = useState<RoomMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [joinSuccess, setJoinSuccess] = useState<string | null>(null);
  const [copiedRoom, setCopiedRoom] = useState<string | null>(null);
  const handleJoinByCodeRef = useRef<(code: string) => void>(() => {});
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDiscoverable, setNewDiscoverable] = useState(false);
  const [creating, setCreating] = useState(false);

  const loadRooms = useCallback(async () => {
    const [{ data: roomsData }, { data: memberData }] = await Promise.all([
      supabase.from('rooms').select('*').order('created_at', { ascending: false }),
      profile ? supabase.from('room_members').select('*').eq('user_id', profile.id) : Promise.resolve({ data: null, error: null }),
    ]);
    setRooms((roomsData as Room[]) ?? []);
    setMyMemberships((memberData as RoomMember[]) ?? []);
    setLoading(false);
  }, [profile]);

  useEffect(() => { loadRooms(); }, [loadRooms]);

  useEffect(() => {
    if (initialInviteCode && profile) {
      setInviteCode(initialInviteCode);
      setShowJoin(true);
      const timer = setTimeout(() => { handleJoinByCodeRef.current(initialInviteCode); }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialInviteCode, profile]);

  const isMember = (roomId: string) => myMemberships.some((m) => m.room_id === roomId && m.status === 'active');
  const isPending = (roomId: string) => myMemberships.some((m) => m.room_id === roomId && m.status === 'pending');
  const isCreator = (room: Room) => room.creator_id === profile?.id;

  const handleJoin = async (room: Room) => {
    setError(null);
    const isPremium = profile?.tier === 'premium' || profile?.is_admin;
    const { error: insertError } = await supabase.from('room_members').insert({ room_id: room.id, user_id: profile!.id, status: isPremium ? 'active' : 'pending', invited_via: 'discovery' });
    if (insertError) { setError(insertError.message); return; }
    await loadRooms();
  };

  const handleJoinByCode = async (codeOverride?: string) => {
    const code = codeOverride ?? inviteCode;
    setError(null); setJoinSuccess(null);
    if (code.trim().length < 10) { setError('Invite code must be at least 10 characters.'); return; }
    const { data: room, error: roomError } = await supabase.from('rooms').select('*').eq('invite_code', code.trim()).maybeSingle();
    if (roomError || !room) { setError('Invalid invite code.'); return; }
    const existing = myMemberships.find((m) => m.room_id === room.id);
    if (existing) { setError(existing.status === 'active' ? 'You are already a member of this room.' : 'Your join request is pending approval.'); return; }
    const isPremium = profile?.tier === 'premium' || profile?.is_admin;
    const { error: insertError } = await supabase.from('room_members').insert({ room_id: room.id, user_id: profile!.id, status: isPremium ? 'active' : 'pending', invited_via: 'invite' });
    if (insertError) { setError(insertError.message); return; }
    setJoinSuccess(isPremium ? `Joined "${room.name}"!` : `Request to join "${room.name}" sent. Pending approval.`);
    setInviteCode('');
    await loadRooms();
  };

  const handleCreate = async () => {
    setError(null);
    if (!newName.trim()) { setError('Room name is required.'); return; }
    if (profile?.tier !== 'premium' && !profile?.is_admin) { setError('Only premium users can create rooms.'); return; }
    setCreating(true);
    const { data, error: createError } = await supabase.from('rooms').insert({ name: newName.trim(), description: newDesc.trim(), creator_id: profile!.id, is_discoverable: newDiscoverable }).select('id').single();
    if (createError || !data) { setError(createError?.message ?? 'Failed to create room.'); setCreating(false); return; }
    await supabase.from('room_members').insert({ room_id: data.id, user_id: profile!.id, status: 'active', invited_via: 'creator' });
    setCreating(false); setShowCreate(false); setNewName(''); setNewDesc(''); setNewDiscoverable(false);
    await loadRooms();
  };

  const copyInviteLink = (room: Room) => {
    const url = `${window.location.origin}?invite=${room.invite_code}`;
    navigator.clipboard.writeText(url); setCopiedRoom(room.id); setTimeout(() => setCopiedRoom(null), 2000);
  };

  handleJoinByCodeRef.current = handleJoinByCode;

  if (loading) { return (<div className="flex-1 flex items-center justify-center"><Loader2 className="w-6 h-6 text-groove-gray animate-spin" /></div>); }

  const myRooms = rooms.filter((r) => isCreator(r) || isMember(r));
  const discoverableRooms = rooms.filter((r) => r.is_discoverable && !isCreator(r) && !isMember(r) && !isPending(r.id));

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide pb-32">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3"><Users className="w-8 h-8 text-white-label-acid" /><h1 className="text-3xl font-bold text-sleeve-cream">Rooms</h1></div>
          <div className="flex gap-2">
            <button onClick={() => setShowJoin(!showJoin)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-groove-charcoal text-sleeve-cream text-xs font-medium hover:bg-groove-charcoal/70 transition-colors"><Plus className="w-3.5 h-3.5" />Join</button>
            {(profile?.tier === 'premium' || profile?.is_admin) && (<button onClick={() => setShowCreate(!showCreate)} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold"><Plus className="w-3.5 h-3.5" />Create</button>)}
          </div>
        </div>
        {error && <p className="text-xs text-test-pressing-red mb-4">{error}</p>}
        {joinSuccess && <p className="text-xs text-white-label-acid mb-4">{joinSuccess}</p>}
        {showJoin && (
          <div className="bg-groove-charcoal rounded-xl p-4 mb-6">
            <h2 className="text-sm font-bold text-sleeve-cream mb-3">Join by invite code</h2>
            <div className="flex gap-2">
              <input type="text" placeholder="Enter invite code..." value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} className="flex-1 bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm border border-groove-charcoal focus:border-white-label-acid focus:outline-none placeholder:text-groove-gray" />
              <button onClick={() => handleJoinByCode()} className="px-4 py-2 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold">Join</button>
            </div>
          </div>
        )}
        {showCreate && (
          <div className="bg-groove-charcoal rounded-xl p-4 mb-6">
            <h2 className="text-sm font-bold text-sleeve-cream mb-3">Create a room</h2>
            <input type="text" placeholder="Room name" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm mb-3 border border-groove-charcoal focus:border-white-label-acid focus:outline-none placeholder:text-groove-gray" />
            <textarea placeholder="Description (optional)" value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full bg-vinyl-black text-sleeve-cream rounded-lg px-3 py-2 text-sm mb-3 border border-groove-charcoal focus:border-white-label-acid focus:outline-none placeholder:text-groove-gray resize-none" rows={2} />
            <label className="flex items-center gap-2 mb-4 cursor-pointer"><input type="checkbox" checked={newDiscoverable} onChange={(e) => setNewDiscoverable(e.target.checked)} className="accent-white-label-acid" /><span className="text-sm text-sleeve-cream">Make discoverable (visible in browse)</span></label>
            <button onClick={handleCreate} disabled={creating} className="w-full bg-white-label-acid text-vinyl-black font-bold py-2.5 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}{creating ? 'Creating...' : 'Create room'}</button>
          </div>
        )}
        <h2 className="text-sm font-bold text-sleeve-cream mb-3">My Rooms</h2>
        {myRooms.length === 0 ? (<p className="text-sm text-groove-gray mb-6">You haven't joined or created any rooms yet.</p>) : (
          <div className="space-y-2 mb-6">
            {myRooms.map((room) => (
              <button key={room.id} onClick={() => onSelectRoom(room.id)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-groove-charcoal hover:bg-groove-charcoal/70 transition-colors text-left">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-vinyl-black flex items-center justify-center">{room.is_discoverable ? <Globe className="w-5 h-5 text-white-label-acid" /> : <Lock className="w-5 h-5 text-groove-gray" />}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-sleeve-cream truncate">{room.name}</p><p className="text-xs text-groove-gray truncate">{isCreator(room) ? 'Creator' : 'Member'}{isPending(room.id) ? ' (pending)' : ''}</p></div>
                <ArrowRight className="w-4 h-4 text-groove-gray flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
        {discoverableRooms.length > 0 && (<><h2 className="text-sm font-bold text-sleeve-cream mb-3">Discover</h2><div className="space-y-2">{discoverableRooms.map((room) => (<div key={room.id} className="flex items-center gap-3 p-3 rounded-xl bg-groove-charcoal/50"><div className="flex-shrink-0 w-10 h-10 rounded-lg bg-vinyl-black flex items-center justify-center"><Globe className="w-5 h-5 text-white-label-acid" /></div><div className="flex-1 min-w-0"><p className="text-sm font-medium text-sleeve-cream truncate">{room.name}</p>{room.description && <p className="text-xs text-groove-gray truncate">{room.description}</p>}</div><button onClick={() => handleJoin(room)} className="flex-shrink-0 px-3 py-1.5 rounded-lg bg-white-label-acid text-vinyl-black text-xs font-bold">{profile?.tier === 'premium' || profile?.is_admin ? 'Join' : 'Request'}</button></div>))}</div></>)}
        {myMemberships.some((m) => m.status === 'pending') && (<><h2 className="text-sm font-bold text-sleeve-cream mt-6 mb-3">Pending Requests</h2><div className="space-y-2">{rooms.filter((r) => isPending(r.id)).map((room) => (<div key={room.id} className="flex items-center gap-3 p-3 rounded-xl bg-groove-charcoal/30"><Clock className="w-5 h-5 text-groove-gray flex-shrink-0" /><div className="flex-1 min-w-0"><p className="text-sm text-sleeve-cream truncate">{room.name}</p><p className="text-xs text-groove-gray">Waiting for approval</p></div></div>))}</div></>)}
      </div>
    </div>
  );
}
