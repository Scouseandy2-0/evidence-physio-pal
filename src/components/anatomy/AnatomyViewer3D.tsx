import { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { 
  OrbitControls, 
  Text, 
  Box, 
  Sphere, 
  Cylinder, 
  Environment,
  ContactShadows,
  Float,
  Html,
  useTexture,
  Torus,
  Cone
} from "@react-three/drei";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Loader2, 
  RotateCcw, 
  Zap, 
  Eye, 
  EyeOff, 
  Play, 
  Pause,
  Info,
  Layers,
  Move3D,
  Search
} from "lucide-react";
import * as THREE from "three";

interface AnatomyPart {
  id: string;
  name: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  type: 'bone' | 'muscle' | 'joint' | 'organ' | 'ligament' | 'cartilage';
  info: string;
  connections?: string[];
  visible: boolean;
  opacity: number;
  size: [number, number, number];
}

const spineAnatomy: AnatomyPart[] = [
  { 
    id: 'c1', 
    name: 'C1 (Atlas)', 
    position: [0, 3.2, 0], 
    rotation: [0, 0, 0],
    scale: [1, 0.8, 1],
    color: '#4A90E2', 
    type: 'bone', 
    info: 'First cervical vertebra that supports the skull and allows nodding motion',
    visible: true,
    opacity: 0.9,
    size: [0.4, 0.3, 0.4]
  },
  { 
    id: 'c2', 
    name: 'C2 (Axis)', 
    position: [0, 2.8, 0], 
    rotation: [0, 0, 0],
    scale: [1, 0.9, 1],
    color: '#5BA3F5', 
    type: 'bone', 
    info: 'Second cervical vertebra with odontoid process, enables head rotation',
    visible: true,
    opacity: 0.9,
    size: [0.4, 0.35, 0.4]
  },
  { 
    id: 'c7', 
    name: 'C7 (Vertebra Prominens)', 
    position: [0, 1.5, 0], 
    rotation: [0, 0, 0],
    color: '#6BB6FF', 
    type: 'bone', 
    info: 'Seventh cervical vertebra with prominent spinous process, easily palpable',
    visible: true,
    opacity: 0.9,
    size: [0.45, 0.4, 0.45]
  },
  { 
    id: 't1', 
    name: 'T1', 
    position: [0, 1.1, 0], 
    rotation: [0, 0, 0],
    color: '#E74C3C', 
    type: 'bone', 
    info: 'First thoracic vertebra, transition from cervical to thoracic spine',
    visible: true,
    opacity: 0.9,
    size: [0.5, 0.4, 0.5]
  },
  { 
    id: 't6', 
    name: 'T6', 
    position: [0, 0, 0], 
    rotation: [0, 0, 0],
    color: '#C0392B', 
    type: 'bone', 
    info: 'Sixth thoracic vertebra, mid-thoracic region',
    visible: true,
    opacity: 0.9,
    size: [0.5, 0.45, 0.5]
  },
  { 
    id: 't12', 
    name: 'T12', 
    position: [0, -1.1, 0], 
    rotation: [0, 0, 0],
    color: '#A93226', 
    type: 'bone', 
    info: 'Twelfth thoracic vertebra, transition to lumbar spine',
    visible: true,
    opacity: 0.9,
    size: [0.55, 0.45, 0.55]
  },
  { 
    id: 'l1', 
    name: 'L1', 
    position: [0, -1.5, 0], 
    rotation: [0, 0, 0],
    color: '#27AE60', 
    type: 'bone', 
    info: 'First lumbar vertebra, largest vertebrae for weight bearing',
    visible: true,
    opacity: 0.9,
    size: [0.6, 0.5, 0.6]
  },
  { 
    id: 'l3', 
    name: 'L3', 
    position: [0, -2.1, 0], 
    rotation: [0, 0, 0],
    color: '#2ECC71', 
    type: 'bone', 
    info: 'Third lumbar vertebra, mid-lumbar region',
    visible: true,
    opacity: 0.9,
    size: [0.65, 0.55, 0.65]
  },
  { 
    id: 'l5', 
    name: 'L5', 
    position: [0, -2.7, 0], 
    rotation: [0, 0, 0],
    color: '#58D68D', 
    type: 'bone', 
    info: 'Fifth lumbar vertebra, articulates with sacrum',
    visible: true,
    opacity: 0.9,
    size: [0.7, 0.6, 0.7]
  },
  { 
    id: 'sacrum', 
    name: 'Sacrum', 
    position: [0, -3.3, 0], 
    rotation: [0, 0, 0],
    scale: [1, 1.2, 0.8],
    color: '#F39C12', 
    type: 'bone', 
    info: 'Triangular bone formed by fusion of 5 sacral vertebrae',
    visible: true,
    opacity: 0.9,
    size: [0.8, 0.7, 0.5]
  },
  // Add muscles and ligaments
  { 
    id: 'erector_spinae', 
    name: 'Erector Spinae', 
    position: [-0.4, 0, -0.3], 
    rotation: [0, 0, 0.1],
    color: '#E67E22', 
    type: 'muscle', 
    info: 'Deep back muscles that extend and maintain spinal posture',
    visible: true,
    opacity: 0.7,
    size: [0.2, 4, 0.3]
  },
  { 
    id: 'multifidus', 
    name: 'Multifidus', 
    position: [0.3, 0, -0.2], 
    rotation: [0, 0, -0.1],
    color: '#D35400', 
    type: 'muscle', 
    info: 'Deep stabilizing muscles of the spine',
    visible: true,
    opacity: 0.6,
    size: [0.15, 3.5, 0.2]
  },
  {
    id: 'anterior_longitudinal',
    name: 'Anterior Longitudinal Ligament',
    position: [0, 0, 0.4],
    color: '#F7DC6F',
    type: 'ligament',
    info: 'Prevents hyperextension of the spine',
    visible: true,
    opacity: 0.8,
    size: [0.1, 5, 0.05]
  }
];

const kneeAnatomy: AnatomyPart[] = [
  { 
    id: 'femur', 
    name: 'Femur', 
    position: [0, 1.5, 0], 
    rotation: [0, 0, 0],
    color: '#3498DB', 
    type: 'bone', 
    info: 'Thighbone - longest and strongest bone in the human body',
    visible: true,
    opacity: 0.9,
    size: [0.3, 2, 0.3]
  },
  { 
    id: 'tibia', 
    name: 'Tibia', 
    position: [-0.1, -1.5, 0], 
    rotation: [0, 0, 0],
    color: '#2980B9', 
    type: 'bone', 
    info: 'Shinbone - main weight-bearing bone of the lower leg',
    visible: true,
    opacity: 0.9,
    size: [0.25, 2, 0.25]
  },
  { 
    id: 'fibula', 
    name: 'Fibula', 
    position: [0.3, -1.5, 0], 
    rotation: [0, 0, 0],
    color: '#5DADE2', 
    type: 'bone', 
    info: 'Smaller bone parallel to tibia, provides muscle attachment',
    visible: true,
    opacity: 0.9,
    size: [0.15, 1.8, 0.15]
  },
  { 
    id: 'patella', 
    name: 'Patella', 
    position: [0, 0.2, 0.4], 
    rotation: [0, 0, 0],
    color: '#E74C3C', 
    type: 'bone', 
    info: 'Kneecap - sesamoid bone that protects the knee joint',
    visible: true,
    opacity: 0.9,
    size: [0.25, 0.3, 0.15]
  },
  { 
    id: 'acl', 
    name: 'ACL', 
    position: [-0.05, 0, 0.1], 
    rotation: [0.3, 0, 0],
    color: '#F1C40F', 
    type: 'ligament', 
    info: 'Anterior Cruciate Ligament - prevents forward displacement of tibia',
    visible: true,
    opacity: 0.8,
    size: [0.05, 0.4, 0.05]
  },
  { 
    id: 'pcl', 
    name: 'PCL', 
    position: [0.05, 0, -0.1], 
    rotation: [-0.3, 0, 0],
    color: '#E67E22', 
    type: 'ligament', 
    info: 'Posterior Cruciate Ligament - prevents backward displacement of tibia',
    visible: true,
    opacity: 0.8,
    size: [0.05, 0.4, 0.05]
  },
  { 
    id: 'medial_meniscus', 
    name: 'Medial Meniscus', 
    position: [-0.15, 0, 0], 
    rotation: [0, 0, 0],
    color: '#27AE60', 
    type: 'cartilage', 
    info: 'C-shaped cartilage that cushions the knee joint',
    visible: true,
    opacity: 0.7,
    size: [0.2, 0.05, 0.15]
  },
  { 
    id: 'lateral_meniscus', 
    name: 'Lateral Meniscus', 
    position: [0.15, 0, 0], 
    rotation: [0, 0, 0],
    color: '#2ECC71', 
    type: 'cartilage', 
    info: 'O-shaped cartilage that cushions the knee joint',
    visible: true,
    opacity: 0.7,
    size: [0.18, 0.05, 0.15]
  },
  {
    id: 'quadriceps',
    name: 'Quadriceps',
    position: [0, 1.5, 0.3],
    color: '#8E44AD',
    type: 'muscle',
    info: 'Four-headed muscle that extends the knee',
    visible: true,
    opacity: 0.6,
    size: [0.4, 1.5, 0.3]
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    position: [0, 1.5, -0.3],
    color: '#9B59B6',
    type: 'muscle',
    info: 'Three muscles that flex the knee',
    visible: true,
    opacity: 0.6,
    size: [0.35, 1.4, 0.25]
  }
];

const shoulderAnatomy: AnatomyPart[] = [
  { 
    id: 'humerus', 
    name: 'Humerus', 
    position: [0, -1.2, 0], 
    rotation: [0, 0, 0],
    color: '#3498DB', 
    type: 'bone', 
    info: 'Upper arm bone that forms the shoulder joint',
    visible: true,
    opacity: 0.9,
    size: [0.25, 2, 0.25]
  },
  { 
    id: 'scapula', 
    name: 'Scapula', 
    position: [-0.7, 0.3, -0.4], 
    rotation: [0, 0.3, 0.2],
    color: '#2980B9', 
    type: 'bone', 
    info: 'Shoulder blade that provides muscle attachment',
    visible: true,
    opacity: 0.9,
    size: [0.5, 0.8, 0.1]
  },
  { 
    id: 'clavicle', 
    name: 'Clavicle', 
    position: [0, 1.2, 0], 
    rotation: [0, 0, 0],
    color: '#5DADE2', 
    type: 'bone', 
    info: 'Collarbone that connects arm to trunk',
    visible: true,
    opacity: 0.9,
    size: [1.5, 0.15, 0.15]
  },
  { 
    id: 'deltoid', 
    name: 'Deltoid', 
    position: [0, 0.2, 0], 
    rotation: [0, 0, 0],
    color: '#E74C3C', 
    type: 'muscle', 
    info: 'Primary shoulder muscle for arm abduction',
    visible: true,
    opacity: 0.7,
    size: [0.6, 0.8, 0.6]
  },
  { 
    id: 'supraspinatus', 
    name: 'Supraspinatus', 
    position: [-0.3, 0.5, -0.2], 
    rotation: [0, 0.2, 0],
    color: '#F39C12', 
    type: 'muscle', 
    info: 'Rotator cuff muscle that initiates arm abduction',
    visible: true,
    opacity: 0.8,
    size: [0.3, 0.15, 0.2]
  },
  { 
    id: 'infraspinatus', 
    name: 'Infraspinatus', 
    position: [-0.4, 0.2, -0.3], 
    rotation: [0, 0.3, 0],
    color: '#E67E22', 
    type: 'muscle', 
    info: 'Rotator cuff muscle for external rotation',
    visible: true,
    opacity: 0.8,
    size: [0.25, 0.2, 0.15]
  },
  { 
    id: 'subscapularis', 
    name: 'Subscapularis', 
    position: [-0.5, 0.1, -0.1], 
    rotation: [0, 0.2, 0],
    color: '#D35400', 
    type: 'muscle', 
    info: 'Rotator cuff muscle for internal rotation',
    visible: true,
    opacity: 0.8,
    size: [0.2, 0.3, 0.1]
  },
  { 
    id: 'teres_minor', 
    name: 'Teres Minor', 
    position: [-0.3, -0.1, -0.25], 
    rotation: [0, 0.4, 0],
    color: '#A0522D', 
    type: 'muscle', 
    info: 'Small rotator cuff muscle for external rotation',
    visible: true,
    opacity: 0.8,
    size: [0.15, 0.1, 0.1]
  }
];

interface AnatomyPartMeshProps {
  part: AnatomyPart;
  isSelected: boolean;
  onClick: () => void;
  animationSpeed: number;
  showLabels: boolean;
}

const AnatomyPartMesh = ({ part, isSelected, onClick, animationSpeed, showLabels }: AnatomyPartMeshProps) => {
  const meshRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current && (isSelected || hovered)) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * animationSpeed) * 0.1;
    }
  });

  if (!part.visible) return null;

  const getGeometry = () => {
    const [width, height, depth] = part.size;
    switch (part.type) {
      case 'bone':
        return <Box args={[width, height, depth]} />;
      case 'muscle':
        return <Sphere args={[Math.max(width, height, depth) * 0.8]} />;
      case 'joint':
      case 'ligament':
        return <Cylinder args={[width * 0.5, width * 0.5, height]} />;
      case 'cartilage':
        return <Torus args={[width * 0.4, width * 0.1]} />;
      default:
        return <Box args={[width, height, depth]} />;
    }
  };

  const materialProps = {
    color: isSelected ? '#FF6B6B' : hovered ? '#4ECDC4' : part.color,
    opacity: Math.min(part.opacity * (hovered ? 1 : 1), 1),
    transparent: part.opacity < 1,
    roughness: 0.3,
    metalness: 0.2,
    emissive: isSelected ? '#FF2222' : hovered ? '#1A4444' : '#000000',
    emissiveIntensity: isSelected ? 0.3 : hovered ? 0.15 : 0,
    side: THREE.DoubleSide
  };

  return (
    <Float
      speed={animationSpeed * 0.5}
      rotationIntensity={isSelected ? 0.3 : 0.1}
      floatIntensity={isSelected ? 0.2 : 0.05}
    >
      <group 
        ref={meshRef}
        position={part.position} 
        rotation={part.rotation || [0, 0, 0]}
        scale={part.scale || [1, 1, 1]}
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <mesh castShadow receiveShadow>
          {getGeometry()}
          <meshStandardMaterial {...materialProps} />
        </mesh>
        
        {showLabels && (hovered || isSelected) && (
          <Html
            position={[0, (part.size[1] / 2) + 0.3, 0]}
            center
            distanceFactor={10}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              pointerEvents: 'none'
            }}
          >
            {part.name}
          </Html>
        )}
      </group>
    </Float>
  );
};

interface AnatomySceneProps {
  anatomy: AnatomyPart[];
  selectedPart: string | null;
  onPartSelect: (partId: string) => void;
  animationSpeed: number;
  showLabels: boolean;
  environmentPreset: string;
}

const AnatomyScene = ({ anatomy, selectedPart, onPartSelect, animationSpeed, showLabels, environmentPreset }: AnatomySceneProps) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (selectedPart) {
      const part = anatomy.find(p => p.id === selectedPart);
      if (part) {
        camera.lookAt(new THREE.Vector3(...part.position));
      }
    }
  }, [selectedPart, anatomy, camera]);

  return (
    <>
      <Environment preset={environmentPreset as any} background={false} />
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} />
      <pointLight position={[-10, -10, -5]} intensity={0.4} color="#4A90E2" />
      
      <ContactShadows
        opacity={0.4}
        scale={20}
        blur={1}
        far={10}
        resolution={256}
        color="#000000"
      />
      
      <OrbitControls 
        enablePan 
        enableZoom 
        enableRotate 
        autoRotate={false}
        autoRotateSpeed={0.5}
        maxPolarAngle={Math.PI}
        minDistance={2}
        maxDistance={15}
      />
      
      {anatomy.map((part) => (
        <AnatomyPartMesh
          key={part.id}
          part={part}
          isSelected={selectedPart === part.id}
          onClick={() => onPartSelect(part.id)}
          animationSpeed={animationSpeed}
          showLabels={showLabels}
        />
      ))}
    </>
  );
};

const LayerControl = ({ anatomy, onToggleVisibility, onOpacityChange }: {
  anatomy: AnatomyPart[];
  onToggleVisibility: (partId: string) => void;
  onOpacityChange: (partId: string, opacity: number) => void;
}) => {
  const groupedParts = anatomy.reduce((groups, part) => {
    if (!groups[part.type]) groups[part.type] = [];
    groups[part.type].push(part);
    return groups;
  }, {} as Record<string, AnatomyPart[]>);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Layers className="h-4 w-4" />
        Layer Controls
      </h3>
      {Object.entries(groupedParts).map(([type, parts]) => (
        <div key={type} className="space-y-2">
          <h4 className="text-sm font-medium capitalize text-muted-foreground">{type}s</h4>
          {parts.map(part => (
            <div key={part.id} className="flex items-center justify-between space-x-2 p-2 rounded border">
              <div className="flex items-center space-x-2 flex-1">
                <Switch
                  checked={part.visible}
                  onCheckedChange={() => onToggleVisibility(part.id)}
                />
                <div className="flex items-center space-x-2 flex-1">
                  <div
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: part.color }}
                  />
                  <span className="text-xs font-medium">{part.name}</span>
                </div>
              </div>
              <div className="w-16">
                <Slider
                  value={[part.opacity * 100]}
                  onValueChange={([value]) => onOpacityChange(part.id, value / 100)}
                  max={100}
                  step={10}
                  className="w-full"
                  disabled={!part.visible}
                />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const AnatomyViewer3D = () => {
  const [selectedRegion, setSelectedRegion] = useState<'spine' | 'knee' | 'shoulder'>('spine');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [anatomy, setAnatomy] = useState<AnatomyPart[]>(spineAnatomy);
  const [animationSpeed, setAnimationSpeed] = useState(1);
  const [showLabels, setShowLabels] = useState(true);
  const [environmentPreset, setEnvironmentPreset] = useState('city');
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    switch (selectedRegion) {
      case 'spine':
        setAnatomy([...spineAnatomy]);
        break;
      case 'knee':
        setAnatomy([...kneeAnatomy]);
        break;
      case 'shoulder':
        setAnatomy([...shoulderAnatomy]);
        break;
    }
    setSelectedPart(null);
  }, [selectedRegion]);

  const selectedPartData = selectedPart 
    ? anatomy.find(part => part.id === selectedPart)
    : null;

  const resetView = () => {
    setSelectedPart(null);
  };

  const toggleVisibility = (partId: string) => {
    setAnatomy(prev => prev.map(part => 
      part.id === partId ? { ...part, visible: !part.visible } : part
    ));
  };

  const updateOpacity = (partId: string, opacity: number) => {
    setAnatomy(prev => prev.map(part => 
      part.id === partId ? { ...part, opacity } : part
    ));
  };

  const filteredAnatomy = anatomy.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Move3D className="h-6 w-6 text-primary" />
            Advanced 3D Anatomy Explorer
          </CardTitle>
          <CardDescription>
            Interactive anatomical visualization with realistic 3D models and advanced controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Body Region</Label>
              <Select value={selectedRegion} onValueChange={(value: any) => {
                setSelectedRegion(value);
              }}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spine">Spine & Back</SelectItem>
                  <SelectItem value="knee">Knee Joint</SelectItem>
                  <SelectItem value="shoulder">Shoulder Complex</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Environment</Label>
              <Select value={environmentPreset} onValueChange={setEnvironmentPreset}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="city">Medical City</SelectItem>
                  <SelectItem value="studio">Clean Studio</SelectItem>
                  <SelectItem value="forest">Natural Forest</SelectItem>
                  <SelectItem value="sunset">Warm Sunset</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Animation Speed</Label>
              <Slider
                value={[animationSpeed]}
                onValueChange={([value]) => setAnimationSpeed(value)}
                min={0}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="flex items-center space-x-4">
              <Button onClick={resetView} variant="outline" size="sm">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={showLabels}
                  onCheckedChange={setShowLabels}
                />
                <Label className="text-sm">Labels</Label>
              </div>
            </div>
          </div>

          <Tabs defaultValue="viewer" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="viewer">3D Viewer</TabsTrigger>
              <TabsTrigger value="layers">Layer Control</TabsTrigger>
              <TabsTrigger value="info">Information</TabsTrigger>
            </TabsList>

            <TabsContent value="viewer" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* 3D Viewer */}
                <div className="lg:col-span-3">
                  <div className="h-[600px] w-full border rounded-lg bg-gradient-to-b from-background to-muted/20 overflow-hidden">
                    <Suspense fallback={
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center space-y-4">
                          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                          <p className="text-sm text-muted-foreground">Loading 3D anatomy...</p>
                        </div>
                      </div>
                    }>
                      <Canvas 
                        camera={{ position: [0, 0, 8], fov: 50 }}
                        shadows
                        dpr={[1, 2]}
                        gl={{ 
                          antialias: true, 
                          alpha: false,
                          preserveDrawingBuffer: true,
                          powerPreference: "high-performance"
                        }}
                        style={{ background: 'transparent' }}
                      >
                        <color attach="background" args={['#f0f4f8']} />
                        <fog attach="fog" args={['#f0f4f8', 5, 20]} />
                        <AnatomyScene
                          anatomy={anatomy}
                          selectedPart={selectedPart}
                          onPartSelect={setSelectedPart}
                          animationSpeed={animationSpeed}
                          showLabels={showLabels}
                          environmentPreset={environmentPreset}
                        />
                      </Canvas>
                    </Suspense>
                  </div>
                  <div className="mt-4 text-center space-y-2">
                    <p className="text-xs text-muted-foreground">
                      🖱️ Click & drag to rotate • 🖱️ Scroll to zoom • 👆 Click structures for details
                    </p>
                    <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
                      <span>Structures: {anatomy.filter(p => p.visible).length}/{anatomy.length}</span>
                      <span>Selected: {selectedPartData?.name || 'None'}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Controls */}
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search structures..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 border rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Anatomical Structures</h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredAnatomy.map((part) => (
                        <div
                          key={part.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedPart === part.id
                              ? 'border-primary bg-primary/10 shadow-md'
                              : part.visible
                              ? 'border-muted hover:border-primary/50 hover:bg-primary/5'
                              : 'border-muted/50 opacity-50'
                          }`}
                          onClick={() => setSelectedPart(part.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: part.color }}
                              />
                              <div>
                                <span className="text-sm font-medium">{part.name}</span>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs">
                                    {part.type}
                                  </Badge>
                                  {!part.visible && (
                                    <EyeOff className="h-3 w-3 text-muted-foreground" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="layers" className="space-y-4">
              <LayerControl
                anatomy={anatomy}
                onToggleVisibility={toggleVisibility}
                onOpacityChange={updateOpacity}
              />
            </TabsContent>

            <TabsContent value="info" className="space-y-4">
              {selectedPartData ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: selectedPartData.color }}
                          />
                          {selectedPartData.name}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="secondary" className="capitalize">
                            {selectedPartData.type}
                          </Badge>
                          <Badge variant="outline">
                            {selectedPartData.visible ? 'Visible' : 'Hidden'}
                          </Badge>
                        </div>
                      </div>
                      <Info className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {selectedPartData.info}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Position:</span>
                        <p className="text-muted-foreground">
                          X: {selectedPartData.position[0].toFixed(1)}<br/>
                          Y: {selectedPartData.position[1].toFixed(1)}<br/>
                          Z: {selectedPartData.position[2].toFixed(1)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium">Properties:</span>
                        <p className="text-muted-foreground">
                          Opacity: {Math.round(selectedPartData.opacity * 100)}%<br/>
                          Visible: {selectedPartData.visible ? 'Yes' : 'No'}<br/>
                          Type: {selectedPartData.type}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t">
                      <Button
                        onClick={() => toggleVisibility(selectedPartData.id)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        {selectedPartData.visible ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Hide
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Show
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => setSelectedPart(null)}
                        variant="outline"
                        size="sm"
                      >
                        Deselect
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Structure Selected</h3>
                    <p className="text-muted-foreground">
                      Click on any anatomical structure in the 3D viewer or structure list to view detailed information.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};