import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Search, Globe } from "lucide-react";

export const StudyGroups = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const sampleGroups = [
    {
      id: '1',
      name: 'MSK Physiotherapy Research Group',
      description: 'Discussing latest research in musculoskeletal physiotherapy interventions',
      topic: 'MSK Research',
      members: 15,
      maxMembers: 20,
      isPublic: true
    },
    {
      id: '2',
      name: 'Neurological Rehabilitation Network',
      description: 'Collaborative learning group for neurological physiotherapy approaches',
      topic: 'Neurological Rehabilitation',
      members: 8,
      maxMembers: 15,
      isPublic: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Study Groups</h1>
        <p className="text-muted-foreground">Join collaborative learning groups to discuss physiotherapy research and share knowledge.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search study groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button><Plus className="h-4 w-4 mr-2" />Create Group</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sampleGroups.map((group) => (
          <Card key={group.id} className="h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{group.topic}</p>
                </div>
                <Globe className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{group.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>{group.members} / {group.maxMembers} members</span>
                </div>
              </div>

              <Button className="w-full">Join Group</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};