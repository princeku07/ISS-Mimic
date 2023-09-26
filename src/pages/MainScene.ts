import * as BABYLON from "@babylonjs/core"
import { 
    AbstractMesh,
    ActionManager,
    ArcRotateCamera,
    Color3,
    CubeTexture,
    EasingFunction,
    Engine,
    ExecuteCodeAction,
    FresnelParameters,
    GlowLayer,
    HemisphericLight,
    HighlightLayer,
    LensFlare,
    LensFlareSystem,
    Mesh,
    MeshBuilder,
    PointLight,
    Scene, 
    SceneLoader, 
    SineEase, 
    StandardMaterial,
    Texture,
    Vector3,
    
} from "@babylonjs/core"
import "@babylonjs/loaders"
import OrbitAnimation from "../components/OrbitAnimation"



const loadingScreen = document.getElementById("loading-screen")

class MainScene {
    scene:Scene
    camera:ArcRotateCamera
    components:AbstractMesh[]
    highlightLayer:HighlightLayer
    material:StandardMaterial
    selectedComponent:AbstractMesh = null
    originalMaterial = null; 
    earthMaterial:StandardMaterial
    earth:Mesh
    earthPosition:Vector3
    sun:PointLight
    light:HemisphericLight
    orbitAnimation:OrbitAnimation

    sphere:Mesh
    lastTime:number = 0
    

    


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
        this.scene.clearColor = new Color3(0,0,0)
        this.highlightLayer = new  HighlightLayer("highlightMesh",this.scene)
        this.highlightLayer.innerGlow = false
        this.highlightLayer.outerGlow = true


        //sphere
        // this.sphere = MeshBuilder.CreateSphere("sphere",{diameter:1,segments:8},this.scene)
        
       
        this.material = new StandardMaterial("clickedMesh")
        this.material.emissiveColor = new Color3(0,1,0.53)
        this.material.specularColor = new Color3(0,0,0)
        this.earthPosition =  new Vector3(0, -4.8, -2.4);
     
        this.light =  new HemisphericLight("light")
        this.light.intensity=1
        this.CreateSkyBox()
        this.createCamera() 
        this.CreateSun()
        this.CreateEarth()
        this.CreateClouds()
        this.nightLights()
        this.CreateAtmos()
        this.IssModel()
        

        
    }

    createCamera(){
        const canvas = this.scene.getEngine().getRenderingCanvas()
        this.camera =  new ArcRotateCamera("camera",-Math.PI/2,Math.PI/2,2.5,Vector3.Zero(), this.scene);
        this.camera.speed = 0.02 
        this.camera.wheelPrecision = 100
        
        this.camera.minZ = 0.02
        this.camera.lowerRadiusLimit = 0.4
        this.camera.upperRadiusLimit = 8
        this.camera.panningSensibility = 0
        this.camera.position = new Vector3(0.01,0.15,1.083)
        this.camera.attachControl(canvas,true)
        // this.camera.onAfterCheckInputsObservable.add(()=>{
        //     console.log("camera position",this.camera.position.toString())
        // })
        this.camera.checkCollisions = true
        
    }

    

    CreateSun(){
        const sun = new PointLight("sun",new Vector3(10,2,20),this.scene)
        sun.intensity=1
        sun.specular = new Color3(0.1,0.1,0.1)
        this.sun = sun
        this.CreateLensFlare()
    }

    CreateLensFlare(){
        const lensFlareSystem = new LensFlareSystem("lensflareSystem",this.sun,this.scene);
        var flare00 = new LensFlare(0.1, 0, new Color3(1, 1, 1), "./flare/flare3.png", lensFlareSystem);
        var flare01 = new LensFlare(0.4, 0.1, new Color3(1, 1, 1), "./flare/flare.png", lensFlareSystem);
        var flare02 = new LensFlare(0.2, 0.2, new Color3(1, 1, 1), "./flare/flare.png", lensFlareSystem);
        var flare02 = new LensFlare(0.1, 0.3, new Color3(1, 1, 1), "./flare/flare3.png", lensFlareSystem);
        var flare03 = new LensFlare(0.3, 0.4, new Color3(0.5, 0.5, 1), "./flare/flare.png", lensFlareSystem);
        var flare05 = new LensFlare(0.8, 1.0, new Color3(1, 1, 1), "./flare/Flare2.png", lensFlareSystem);
        var flare05 = new LensFlare(0.8, 1.0, new Color3(1, 1, 1), "./flare/flare.png", lensFlareSystem);
    }

   // Space sky box
   
   CreateSkyBox(){
    const skyBox = Mesh.CreateBox("skyBox",10000.0,this.scene);
    const skyBoxMaterial = new StandardMaterial("skyBox",this.scene)
    skyBoxMaterial.backFaceCulling = false
    const files = [
        './space/space.jpg', //left
        './space/space.jpg',   //up
        './space/milky_way.jpg',//front
        './space/space.jpg',//right
        './space/space.jpg', //down
        './space/space.jpg'  //back
    ];
    skyBoxMaterial.reflectionTexture = CubeTexture.CreateFromImages(files,this.scene);
    skyBoxMaterial.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE
    skyBoxMaterial.diffuseColor = new Color3(0,0,0)
    skyBoxMaterial.specularColor = new Color3(0,0,0)
    skyBoxMaterial.disableLighting = false
    skyBox.material = skyBoxMaterial
   }


   //Create Earth
   CreateEarth(){
       const earth = MeshBuilder.CreateSphere("earth",{ diameter: 7.5, segments: 12 },this.scene);
       earth.isBlocker = true
       earth.rotation.z = Math.PI
       const earthMaterial = new StandardMaterial("earth",this.scene)

       earthMaterial.diffuseTexture = new Texture("./earth/earth_daymap.jpg")
       earthMaterial.bumpTexture = new Texture("./earth/normalmap.jpg")
       earthMaterial.specularTexture = new Texture("./earth/earth_specular_map.png")
       earth.material = earthMaterial
       this.earthMaterial = earthMaterial
       // Position Earth
       earth.position = this.earthPosition
       earth.checkCollisions = true
       this.light.excludedMeshes.push(earth)
       this.earth = earth
      

       
   }

   CreateClouds(){
     //clouds
     const cloud =  MeshBuilder.CreateSphere("clouds",{diameter:7.7, segments:12},this.scene);
     const cloudMaterial = new StandardMaterial("clouds")
     cloudMaterial.diffuseTexture = new Texture("./earth/newCloud.png")
     cloudMaterial.diffuseTexture.hasAlpha = true
     cloudMaterial.alphaMode = Engine.ALPHA_MULTIPLY
     cloudMaterial.specularColor = new Color3(0,0,0)
     cloud.material = cloudMaterial
     cloud.position = this.earthPosition
     cloud.rotation.z = Math.PI/2
     this.cloud = cloud
     this.light.excludedMeshes.push(cloud)
   }

   CreateAtmos(){
    const atmos =  MeshBuilder.CreateSphere("atmos",{diameter:7.8, segments:30},this.scene);
    const atmosMaterial = new StandardMaterial("atmos")
    atmosMaterial.specularColor = new Color3(0,0,0)
    atmosMaterial.emissiveColor =  Color3.FromHexString("#1eadff")
    
    // atmosMaterial.diffuseColor =new BABYLON.Color3(0.1, 0.5, 1)
    atmosMaterial.alpha = 0
    atmosMaterial.emissiveFresnelParameters = new FresnelParameters();
    atmosMaterial.emissiveFresnelParameters.bias = 0.7;
    atmosMaterial.emissiveFresnelParameters.power = 4;
    atmosMaterial.emissiveFresnelParameters.leftColor = Color3.FromHexString("#29bbff")
    atmosMaterial.emissiveFresnelParameters.rightColor = Color3.Black();

    atmosMaterial.opacityFresnelParameters = new FresnelParameters();
    atmosMaterial.opacityFresnelParameters.leftColor = Color3.FromHexString("#ffe600");
    atmosMaterial.opacityFresnelParameters.rightColor = Color3.Black();
    atmos.material = atmosMaterial
    // atmos.material = shaderMaterial
    atmos.position = this.earthPosition
    atmos.checkCollisions =true
    this.light.excludedMeshes.push(atmos)
   }

   nightLights(){
    this.earthMaterial.emissiveTexture = new Texture("./earth/earth_nightlights.png")
    const glowLayer = new GlowLayer("glow",this.scene);
    glowLayer.customEmissiveColorSelector = function (mesh,subMesh,material,result){
     if(mesh.name == "earth"){
         result.set(1,0.85,0.21,1)
     } else {
         result.set(0,0,0)
     }
    }
   }


   async IssModel() {
    try {
        const { meshes } = await SceneLoader.ImportMeshAsync(
            "","https://cdn.jsdelivr.net/gh/XperienceLabs/ISS_mimic@ad28720f3cb90099a8bcd114e19de99c2c1b9b22/public/Iss.glb","",
            this.scene,
            function (evt) {
                let loadingPercentage = 0;
                if (evt.lengthComputable) {
                    loadingPercentage = (evt.loaded / evt.total) * 100;
                }
                const progressBar = document.getElementById("progress-bar");
                // console.log(loadingPercentage);
                progressBar.style.width = `${loadingPercentage}%`;
            }
        );
        // const plane = MeshBuilder.CreatePlane("helper",{size:0.5})
        // const planeMat = new BABYLON.StandardMaterial("mat")
        // plane.rotation.x = -Math.PI/6
        // meshes[0].setParent(plane)
        // planeMat.backFaceCulling = false
        // plane.material = planeMat
        for(const mesh of meshes){
            mesh.isBlocker = true
            
        }
        // this.orbitAnimation = new OrbitAnimation(this.earth,5.3,0.2)
        // this.orbitAnimation.createOrbitPathLines(this.scene)
        // this.orbitAnimation.animateMesh(plane,this.scene,5)
        
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
        // const followCamera = new BABYLON.FollowCamera("followCamera",new BABYLON.Vector3(0,0,0),this.scene)
        // followCamera.lockedTarget = meshes[0]
        // followCamera.heightOffset = 2
        // followCamera.radius = 0.2
        // followCamera.cameraAcceleration = 0.05
        // this.scene.activeCamera = followCamera
    } catch (error) {
        console.error("An error occurred during ISS model loading:", error);
        // Handle the error, such as displaying a message to the user or retrying
    }
}




changeRotation(){
    this.components[0].rotation.z = Math.PI/6
    this.components[1].rotation.z = Math.PI/4
    
}

getComponent(name:string,meshes:AbstractMesh[]){

    
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

addInteractionListeners(mesh:AbstractMesh){
    mesh.isPickable = true
    mesh.actionManager = new ActionManager(this.scene)
    mesh.actionManager.registerAction(
        new ExecuteCodeAction(
            ActionManager.OnPickTrigger,
            () => {
                this.handleMeshInteraction(mesh,"click")
            }
        )
    );

    mesh.actionManager.registerAction(
        new ExecuteCodeAction(
            ActionManager.OnPointerOverTrigger,
            ()=> {
                this.handleMeshInteraction(mesh,'hoverIn')
            } 
        )
    )

    mesh.actionManager.registerAction(
        new ExecuteCodeAction(
            ActionManager.OnPointerOutTrigger,
            () => {
                this.handleMeshInteraction(mesh,"hoverOut")
            }
        )
    )
}

handleMeshInteraction(mesh:AbstractMesh,event:string){
    switch (event){
        case 'click':
            this.handleMeshClick(mesh)
            this.moveCameraToMesh(mesh)
            this.highlightLayer.removeMesh(mesh)
            break
        
        case 'hoverIn':
            this.highlightLayer.addMesh(mesh,new Color3(0,0.43,1))
            break
        
        case 'hoverOut':
            this.highlightLayer.removeMesh(mesh)
            break
    }
}

handleMeshClick(mesh:AbstractMesh){

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
    const normal = mesh.getFacetNormal(1); // Assuming face 0, you can change this as needed
    const cameraPosition = targetPosition.subtract(normal.scale(3)); // Adjust the scale factor as needed

    // Create an easing function for smoother animation
    const ease = new SineEase();
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT);

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

   startOrbitAnimation(){
    this.scene.registerBeforeRender(() => {
        const currentTime = this.scene.getEngine().getDeltaTime()/10 + this.lastTime
        this.orbitAnimation.updatePosition(currentTime)
        this.lastTime = currentTime
    })
   }

    

    onRender(){
       this.earth.rotation.y -= 0.005
       this.cloud.rotation.y -=0.002
    }
}

export default MainScene