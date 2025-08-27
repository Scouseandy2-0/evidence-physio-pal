import { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Text, Box, Sphere, Cylinder } from "@react-three/drei";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, RotateCcw, Zap } from "lucide-react";
import * as THREE from "three";

interface AnatomyPart {
  id: string;
  name: string;
  position: [number, number, number];
  color: string;
  type: 'bone' | 'muscle' | 'joint' | 'organ';
  info: string;
}

const spineAnatomy: AnatomyPart[] = [
  { id: 'c1', name: 'C1 (Atlas)', position: [0, 3, 0], color: '#e6f3ff', type: 'bone', info: 'First cervical vertebra, supports the skull' },
  { id: 'c2', name: 'C2 (Axis)', position: [0, 2.7, 0], color: '#e6f3ff', type: 'bone', info: 'Second cervical vertebra, allows head rotation' },
  { id: 'c7', name: 'C7', position: [0, 1.5, 0], color: '#e6f3ff', type: 'bone', info: 'Seventh cervical vertebra, prominent spinous process' },
  { id: 't1', name: 'T1', position: [0, 1.2, 0], color: '#ffe6e6', type: 'bone', info: 'First thoracic vertebra' },
  { id: 't12', name: 'T12', position: [0, -1, 0], color: '#ffe6e6', type: 'bone', info: 'Twelfth thoracic vertebra' },
  { id: 'l1', name: 'L1', position: [0, -1.3, 0], color: '#e6ffe6', type: 'bone', info: 'First lumbar vertebra' },
  { id: 'l5', name: 'L5', position: [0, -2.5, 0], color: '#e6ffe6', type: 'bone', info: 'Fifth lumbar vertebra' },
  { id: 'sacrum', name: 'Sacrum', position: [0, -3, 0], color: '#fff0e6', type: 'bone', info: 'Triangular bone at base of spine' },
];

const kneeAnatomy: AnatomyPart[] = [
  { id: 'femur', name: 'Femur', position: [0, 1, 0], color: '#e6f3ff', type: 'bone', info: 'Thighbone, longest bone in body' },
  { id: 'tibia', name: 'Tibia', position: [0, -1, 0], color: '#e6f3ff', type: 'bone', info: 'Shinbone, main weight-bearing bone' },
  { id: 'fibula', name: 'Fibula', position: [0.3, -1, 0], color: '#e6f3ff', type: 'bone', info: 'Smaller bone parallel to tibia' },
  { id: 'patella', name: 'Patella', position: [0, 0, 0.3], color: '#ffe6e6', type: 'bone', info: 'Kneecap, protects knee joint' },
  { id: 'acl', name: 'ACL', position: [0, 0, 0], color: '#ffffe6', type: 'joint', info: 'Anterior cruciate ligament' },
  { id: 'pcl', name: 'PCL', position: [0, 0, -0.1], color: '#ffffe6', type: 'joint', info: 'Posterior cruciate ligament' },
  { id: 'meniscus', name: 'Meniscus', position: [0, 0, 0.1], color: '#e6ffe6', type: 'joint', info: 'Cartilage shock absorber' },
];

const shoulderAnatomy: AnatomyPart[] = [
  { id: 'humerus', name: 'Humerus', position: [0, -1, 0], color: '#e6f3ff', type: 'bone', info: 'Upper arm bone' },
  { id: 'scapula', name: 'Scapula', position: [-0.5, 0.5, -0.3], color: '#e6f3ff', type: 'bone', info: 'Shoulder blade' },
  { id: 'clavicle', name: 'Clavicle', position: [0, 1, 0], color: '#e6f3ff', type: 'bone', info: 'Collarbone' },
  { id: 'deltoid', name: 'Deltoid', position: [0, 0, 0], color: '#ffe6e6', type: 'muscle', info: 'Primary shoulder muscle' },
  { id: 'rotator_cuff', name: 'Rotator Cuff', position: [0, 0, -0.2], color: '#ffffe6', type: 'muscle', info: 'Group of four muscles stabilizing shoulder' },
];

interface AnatomyPartMeshProps {
  part: AnatomyPart;
  isSelected: boolean;
  onClick: () => void;
}

const AnatomyPartMesh = ({ part, isSelected, onClick }: AnatomyPartMeshProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current && isSelected) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  const getGeometry = () => {
    switch (part.type) {
      case 'bone':
        return <Box args={[0.3, 0.3, 0.3]} />;
      case 'muscle':
        return <Sphere args={[0.2]} />;
      case 'joint':
        return <Cylinder args={[0.1, 0.1, 0.2]} />;
      default:
        return <Box args={[0.2, 0.2, 0.2]} />;
    }
  };

  return (
    <group position={part.position} onClick={onClick}>
      <mesh ref={meshRef}>
        {getGeometry()}
        <meshStandardMaterial
          color={isSelected ? '#ff6b6b' : part.color}
          opacity={0.8}
          transparent
        />
      </mesh>
      <Text
        position={[0, 0.4, 0]}
        fontSize={0.1}
        color="black"
        anchorX="center"
        anchorY="middle"
      >
        {part.name}
      </Text>
    </group>
  );
};

interface AnatomySceneProps {
  anatomy: AnatomyPart[];
  selectedPart: string | null;
  onPartSelect: (partId: string) => void;
}

const AnatomyScene = ({ anatomy, selectedPart, onPartSelect }: AnatomySceneProps) => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <OrbitControls enablePan enableZoom enableRotate />
      
      {anatomy.map((part) => (
        <AnatomyPartMesh
          key={part.id}
          part={part}
          isSelected={selectedPart === part.id}
          onClick={() => onPartSelect(part.id)}
        />
      ))}
    </>
  );
};

export const AnatomyViewer3D = () => {
  const [selectedRegion, setSelectedRegion] = useState<'spine' | 'knee' | 'shoulder'>('spine');
  const [selectedPart, setSelectedPart] = useState<string | null>(null);

  const getAnatomyData = () => {
    switch (selectedRegion) {
      case 'spine': return spineAnatomy;
      case 'knee': return kneeAnatomy;
      case 'shoulder': return shoulderAnatomy;
      default: return spineAnatomy;
    }
  };

  const selectedPartData = selectedPart 
    ? getAnatomyData().find(part => part.id === selectedPart)
    : null;

  const resetView = () => {
    setSelectedPart(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Interactive 3D Anatomy
          </CardTitle>
          <CardDescription>
            Explore anatomical structures in 3D for better treatment planning
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Body Region</label>
              <Select value={selectedRegion} onValueChange={(value: any) => {
                setSelectedRegion(value);
                setSelectedPart(null);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spine">Spine</SelectItem>
                  <SelectItem value="knee">Knee</SelectItem>
                  <SelectItem value="shoulder">Shoulder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button onClick={resetView} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset View
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 3D Viewer */}
            <div className="lg:col-span-2">
              <div className="h-96 w-full border rounded-lg bg-gradient-to-b from-sky-50 to-white">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                }>
                  <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                    <AnatomyScene
                      anatomy={getAnatomyData()}
                      selectedPart={selectedPart}
                      onPartSelect={setSelectedPart}
                    />
                  </Canvas>
                </Suspense>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Click and drag to rotate • Scroll to zoom • Click structures for details
              </p>
            </div>

            {/* Information Panel */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-3">Anatomical Structures</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {getAnatomyData().map((part) => (
                    <div
                      key={part.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        selectedPart === part.id
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedPart(part.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: part.color }}
                        />
                        <span className="text-sm font-medium">{part.name}</span>
                        <Badge variant="outline" className="ml-auto text-xs">
                          {part.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedPartData && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{selectedPartData.name}</CardTitle>
                    <Badge variant="secondary" className="w-fit">
                      {selectedPartData.type.charAt(0).toUpperCase() + selectedPartData.type.slice(1)}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedPartData.info}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};