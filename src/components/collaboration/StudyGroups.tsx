import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { PremiumFeature } from "@/components/subscription/PremiumFeature";
import { supabase } from "@/integrations/supabase/client";
import { Users, Plus, MessageSquare, Calendar, UserPlus, Crown } from "lucide-react";

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  topic: string;
  created_by: string;
  max_members: number;
  is_public: boolean;
  meeting_schedule: any;
  created_at: string;
  member_count?: number;
  is_member?: boolean;
  creator_name?: string;
}

interface StudyGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

export const StudyGroups = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { subscribed } = useSubscription();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    topic: '',
    max_members: 20
  });

  useEffect(() => {
    if (user) {
      fetchStudyGroups();
    }
  }, [user]);

  const fetchStudyGroups = async () => {
    try {
      // Fetch public study groups with member counts
      const { data: groups, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user is a member of each group
      const groupsWithMembership = await Promise.all(
        (groups || []).map(async (group) => {
          const { data: membership } = await supabase
            .from('study_group_members')
            .select('*')
            .eq('group_id', group.id)
            .eq('user_id', user?.id || '')
            .single();

          return {
            ...group,
            member_count: group.study_group_members?.[0]?.count || 0,
            is_member: !!membership
          };
        })
      );

      setStudyGroups(groupsWithMembership);
    } catch (error: any) {
      console.error('Error fetching study groups:', error);
      toast({
        title: "Error",
        description: "Failed to load study groups",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createStudyGroup = async () => {
    if (!user) return;

    if (!newGroup.name.trim() || !newGroup.topic.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and topic are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('study_groups')
        .insert({
          name: newGroup.name.trim(),
          description: newGroup.description.trim(),
          topic: newGroup.topic.trim(),
          max_members: newGroup.max_members,
          created_by: user.id,
          is_public: true
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as admin member
      await supabase
        .from('study_group_members')
        .insert({
          group_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      toast({
        title: "Success",
        description: "Study group created successfully",
      });

      setNewGroup({ name: '', description: '', topic: '', max_members: 20 });
      setShowCreateForm(false);
      fetchStudyGroups();
    } catch (error: any) {
      console.error('Error creating study group:', error);
      toast({
        title: "Error",
        description: "Failed to create study group",
        variant: "destructive",
      });
    }
  };

  const joinGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Joined study group successfully",
      });

      fetchStudyGroups();
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: "Failed to join study group",
        variant: "destructive",
      });
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Left study group successfully",
      });

      fetchStudyGroups();
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error",
        description: "Failed to leave study group",
        variant: "destructive",
      });
    }
  };

  if (!subscribed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PremiumFeature feature="Study Groups" showUpgrade={true}>
          <div className="text-center py-12">
            <Users className="h-16 w-16 mx-auto mb-6 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-4">Study Groups</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join collaborative learning groups and professional development communities.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto mb-8">
              <div className="p-4 border rounded-lg">
                <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-2">Group Learning</h3>
                <p className="text-sm text-muted-foreground">Collaborate with peers in specialized study groups</p>
              </div>
              <div className="p-4 border rounded-lg">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                <h3 className="font-semibold mb-2">Discussion Forums</h3>
                <p className="text-sm text-muted-foreground">Engage in professional discussions and knowledge sharing</p>
              </div>
            </div>
          </div>
        </PremiumFeature>
      </div>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to join study groups</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Study Groups
              </CardTitle>
              <CardDescription>
                Join collaborative learning groups and professional discussions
              </CardDescription>
            </div>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant={showCreateForm ? "outline" : "default"}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showCreateForm ? "Cancel" : "Create Group"}
            </Button>
          </div>
        </CardHeader>

        {showCreateForm && (
          <CardContent className="border-t">
            <div className="space-y-4">
              <h3 className="font-semibold">Create New Study Group</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Group Name *</label>
                  <Input
                    placeholder="e.g., Advanced Manual Therapy"
                    value={newGroup.name}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic *</label>
                  <Input
                    placeholder="e.g., Manual Therapy, Sports Rehab"
                    value={newGroup.topic}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, topic: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Describe what this study group will focus on..."
                  value={newGroup.description}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Members</label>
                <Input
                  type="number"
                  min="5"
                  max="50"
                  value={newGroup.max_members}
                  onChange={(e) => setNewGroup(prev => ({ ...prev, max_members: parseInt(e.target.value) || 20 }))}
                />
              </div>
              <Button onClick={createStudyGroup} className="w-full">
                Create Study Group
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                  <div className="h-8 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : studyGroups.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">No study groups available</p>
            <p className="text-sm text-muted-foreground">Be the first to create one!</p>
          </div>
        ) : (
          studyGroups.map((group) => (
            <Card key={group.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <Badge variant="outline">{group.topic}</Badge>
                  </div>
                  {group.is_member && (
                    <Badge variant="default">
                      <Crown className="h-3 w-3 mr-1" />
                      Member
                    </Badge>
                  )}
                </div>
                {group.description && (
                  <CardDescription className="line-clamp-3">
                    {group.description}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {group.member_count}/{group.max_members} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(group.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {group.is_member ? (
                      <>
                        <Button size="sm" className="flex-1">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Enter Group
                        </Button>
                        <Button
                          onClick={() => leaveGroup(group.id)}
                          variant="outline"
                          size="sm"
                        >
                          Leave
                        </Button>
                      </>
                    ) : (
                      <Button
                        onClick={() => joinGroup(group.id)}
                        size="sm"
                        className="w-full"
                        disabled={group.member_count >= group.max_members}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {group.member_count >= group.max_members ? 'Full' : 'Join Group'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};