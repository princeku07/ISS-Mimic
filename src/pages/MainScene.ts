import * as BABYLON from "@babylonjs/core"
import { MeshBuilder,Scene } from "@babylonjs/core"
import "@babylonjs/loaders"

const loadingScreen = document.getElementById("loading-screen")

class MainScene {
    scene:Scene
    camera:BABYLON.ArcRotateCamera
    components:BABYLON.AbstractMesh[]
    highlightLayer:BABYLON.HighlightLayer
    material:BABYLON.StandardMaterial
    selectedComponent:BABYLON.AbstractMesh = null
    originalMaterial = null; 
    

    


    constructor(scene:Scene){
        this.scene = scene
        this.onSceneReady()
        this.scene.whenReadyAsync().then(() => {
            loadingScreen.style.display = 'none'
            setTimeout(()=> {
                this.changeRotation()
            },5000)
        })
    }

    

    onSceneReady(){
        this.scene.clearColor = new BABYLON.Color3(0,0,0)
        const light = new BABYLON.HemisphericLight("light")
        this.highlightLayer = new BABYLON.HighlightLayer("highlightMesh",this.scene)
        this.highlightLayer.innerGlow = false
        this.highlightLayer.outerGlow = true
        this.material = new BABYLON.StandardMaterial("clickedMesh")
        this.material.emissiveColor = new BABYLON.Color3(0,1,0.53)
        this.material.roughness = 0
        this.material.specularColor = new BABYLON.Color3(0.2,0.2,0.2)
        this.createCamera() 
        this.IssModel()
        
    }

    createCamera(){
        const canvas = this.scene.getEngine().getRenderingCanvas()
        this.camera =  new BABYLON.ArcRotateCamera("camera",-Math.PI/2,Math.PI/2,2.5,BABYLON.Vector3.Zero(), this.scene);
        this.camera.speed = 0.02 
        this.camera.wheelPrecision = 100
        this.camera.minZ = 0.02
        this.camera.lowerRadiusLimit = 1
        this.camera.upperRadiusLimit = 5
        this.camera.panningSensibility = 0

        this.camera.attachControl(canvas,true)
    }

    async IssModel() {
        try {
            const { meshes } = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                "https://cdn.jsdelivr.net/gh/XperienceLabs/ISS_mimic@9c0c74f5fea93493fce5d622bad999f75c120e8d/public/Iss.glb",
                "",
                this.scene,
                function (evt) {
                    let loadingPercentage = 0;
                    if (evt.lengthComputable) {
                        loadingPercentage = (evt.loaded / evt.total) * 100;
                    }
                    const progressBar = document.getElementById("progress-bar");
                    console.log(loadingPercentage);
                    progressBar.style.width = `${loadingPercentage}%`;
                }
            );
    
            // Initialize solar panels using names to map the meshes
            this.components = [
                "MainPanel1", "MainPanel2", "MainPanel3", "MainPanel4",
                "MainPanel5", "MainPanel6", "MainPanel7", "MainPanel8", "DestinyLab",
                "KiboLab", "ColumbusLab", "HarmonyModule", "TranquilityModule",
                "ZaryaBlock", "ZvezdaModule"
            ].map(name => this.getComponent(name, meshes));

            // Add click event listeners to meshes
            for(const mesh of this.components){
                
                this.addInteractionListeners(mesh)
            }
            this.sceneEvent()
        } catch (error) {
            console.error("An error occurred during ISS model loading:", error);
            // Handle the error, such as displaying a message to the user or retrying
        }
    }
    

    

    changeRotation(){
        this.components[0].rotation.z = Math.PI/6
        this.components[1].rotation.z = Math.PI/4
        
    }

    getComponent(name:string,meshes:BABYLON.AbstractMesh[]){

        
        //create hash map to store meshes by name
        const meshMap = {}
        for(const mesh of meshes){
            meshMap[mesh.name] = mesh
        }

        //check if an exact match exits in the hash map
        if(meshMap[name]){
            return meshMap[name]
        }

        //if not , then check for partial matching
        let parentMesh = null
        for(const mesh of meshes){
            if(mesh.name.includes(name)){
                if(!parentMesh){
                    parentMesh = mesh
                }
                else {
                    mesh.setParent(parentMesh)
                }
            }
        }
        return parentMesh
    }

    addInteractionListeners(mesh:BABYLON.AbstractMesh){
        mesh.isPickable = true
        mesh.actionManager = new BABYLON.ActionManager(this.scene)
        mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                () => {
                    this.handleMeshInteraction(mesh,"click")
                }
            )
        );

        mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPointerOverTrigger,
                ()=> {
                    this.handleMeshInteraction(mesh,'hoverIn')
                } 
            )
        )

        mesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPointerOutTrigger,
                () => {
                    this.handleMeshInteraction(mesh,"hoverOut")
                }
            )
        )
    }

    handleMeshInteraction(mesh:BABYLON.AbstractMesh,event:string){
        switch (event){
            case 'click':
                this.handleMeshClick(mesh)
                this.moveCameraToMesh(mesh)
                
                break
            
            case 'hoverIn':
                this.highlightLayer.addMesh(mesh,new BABYLON.Color3(0,0.43,1))
                break
            
            case 'hoverOut':
                this.highlightLayer.removeMesh(mesh)
                break
        }
    }

    handleMeshClick(mesh){

        //Check if we have any component is selected 
        if(this.selectedComponent){

            // If true then reverts the previously selected
            this.selectedComponent.material = this.originalMaterial
        }

        //Check if the clicked mesh is the same as the previously selected one
        if(this.selectedComponent === mesh){

            // If true then unselect it 
            this.selectedComponent = null
            this.originalMaterial = null
        }

        // If the clicked mesh is not the same as previously selected one
         else {

            // Update the mesh
            this.selectedComponent = mesh
            
            // store the current material
            this.originalMaterial = mesh.material;

            // Finally apply the material which indicates selected
            mesh.material = this.material
        }
    }

    // Move the camera to the clicked mesh with smoother animation and better view
    moveCameraToMesh(mesh) {


        const targetPosition = mesh.getAbsolutePosition();

        // Calculate the new camera position using the clicked mesh's face normals
        const normal = mesh.getFacetNormal(0); // Assuming face 0, you can change this as needed
        const cameraPosition = targetPosition.subtract(normal.scale(5)); // Adjust the scale factor as needed

        // Create an easing function for smoother animation
        const ease = new BABYLON.SineEase();
        ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT);

        // Create a position animation with easing
        const positionAnimation = new BABYLON.Animation(
            'cameraPositionAnimation',
            'position',
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
        );
        positionAnimation.setEasingFunction(ease);
        positionAnimation.setKeys([
            { frame: 0, value: this.camera.position },
            { frame: 60, value: cameraPosition }
        ]);

        // Attach the animation to the camera and start it
        this.camera.animations = [positionAnimation];
        this.scene.beginAnimation(this.camera, 0, 60);
   }

   sceneEvent(){
    this.scene.onPointerDown = () => {
        if(this.selectedComponent){
            this.selectedComponent.material = this.originalMaterial
        }
    }
   }

    

    onRender(){

    }
}

export default MainScene