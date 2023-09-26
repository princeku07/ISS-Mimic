import { LinesMesh, Mesh, MeshBuilder, Path3D, Scene, Vector3 } from "@babylonjs/core";
class OrbitAnimation {
    private mesh:Mesh;
    private orbitRadius:number;
    private orbitSpeed:number;
    private angle:number;
    private orbitPath:Path3D;

    constructor(mesh:BABYLON.Mesh,orbitRadius:number,speed:number){
        this.mesh = mesh
        this.orbitRadius = orbitRadius
        this.orbitSpeed = speed
        this.angle = 0
        this.orbitPath = this.createOrbitPath()
    }

    private createOrbitPath(): Path3D {
        const points = [];
        const resolution = 100;

        //
    
        for (let i = 0; i <= resolution; i++) {
            const theta = (Math.PI * 2 * i) / resolution;
            const y = this.orbitRadius * Math.cos(theta);
            const z = this.orbitRadius * Math.sin(theta);
            points.push(new Vector3(0, y, z)); 
        }
        
        // Offset the path to match the center of the mesh
        const centerOffset = this.mesh.position.clone();
        for (const point of points) {
            point.addInPlace(centerOffset)
        }
    
        return new Path3D(points);
    }
    

   

    public createOrbitPathLines(scene:Scene):LinesMesh{
        const orbitPoints = this.orbitPath.getPoints()
        const orbitPathLines = MeshBuilder.CreateLines("orbitPath",{points:orbitPoints,instance:null,updatable:true},scene)
        return orbitPathLines
    }


    animateMesh(model: Mesh, scene: Scene,speed:number) {
        const curvePath = this.orbitPath.getCurve();
        const tangents = this.orbitPath.getTangents();
        const binormals = this.orbitPath.getBinormals();
    
        // Create a keyframe animation for position and rotation
        const positionAnimation = new Animation(
            "positionAnimation",
            "position",
            speed, // Frames per second
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );
    
        const rotationAnimation = new Animation(
            "rotationAnimation",
            "rotation",
            speed, // Frames per second
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        );
    
        // Create keyframes for position and rotation
        const positionKeys = [];
        const rotationKeys = [];
        for (let i = curvePath.length - 1; i >= 0; i--) {
            positionKeys.push({
                frame: curvePath.length - i - 1,
                value: curvePath[i]
            });
    
            // Calculate rotation from tangent and binormal vectors
            const rotation = new Vector3(
                Math.atan2(binormals[i].y, tangents[i].y),
                Math.atan2(binormals[i].x, tangents[i].x),
                Math.atan2(binormals[i].z, tangents[i].z)
            );
    
            rotationKeys.push({
                frame: curvePath.length - i - 1,
                value: rotation
            });
        }
    
        // Assign keys to the animations
        positionAnimation.setKeys(positionKeys);
        rotationAnimation.setKeys(rotationKeys);
    
        // Attach the animations to the model
        model.animations = [positionAnimation, rotationAnimation];
    
        // Start the animations
        scene.beginAnimation(model, 0, curvePath.length - 1, true);
    }
    
    
    
    

    
    

}

export default  OrbitAnimation