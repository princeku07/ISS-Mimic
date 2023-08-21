import * as BABYLON from "@babylonjs/core"
import { MeshBuilder,Scene } from "@babylonjs/core"
import "@babylonjs/loaders"

const loadingScreen = document.getElementById("loading-screen")

class MainScene {
    scene:Scene
    camera:BABYLON.ArcRotateCamera
    solarPanel1:BABYLON.AbstractMesh
    solarPanel2:BABYLON.AbstractMesh
    solarPanel3:BABYLON.AbstractMesh
    solarPanel4:BABYLON.AbstractMesh
    solarPanel5:BABYLON.AbstractMesh
    solarPanel6:BABYLON.AbstractMesh
    solarPanel7:BABYLON.AbstractMesh
    solarPanel8:BABYLON.AbstractMesh
    

    constructor(scene:Scene){
        this.scene = scene
        this.onSceneReady()
        this.scene.whenReadyAsync().then(() => {
            loadingScreen.style.display = 'none'
        })
    }

    

    onSceneReady(){
        this.scene.clearColor = new BABYLON.Color3(0,0,0)
        const light = new BABYLON.HemisphericLight("light")
        this.createCamera()
            
        this.customModel("Iss.glb")
        setTimeout(()=> {
            this.changeRotation()
        },5000)
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

    async customModel(fileLocation){
        const {meshes} = await BABYLON.SceneLoader.ImportMeshAsync("","https://cdn.jsdelivr.net/gh/XperienceLabs/ISS_mimic@9c0c74f5fea93493fce5d622bad999f75c120e8d/public/Iss.glb","",this.scene,function(evt){
            let loadingPercentage = 0
            if(evt.lengthComputable){
               
                loadingPercentage = (evt.loaded/evt.total) * 100
            }
            const progressBar = document.getElementById("progress-bar")
            progressBar.style.width = `${loadingPercentage}%`
        })

        this.solarPanels = [ "MainPanel1", "MainPanel2", "MainPanel3", "MainPanel4",
        "MainPanel5", "MainPanel6", "MainPanel7", "MainPanel8"].map(name => this.getPanel(name,meshes))
        this.solarPanel1 = this.solarPanels[0]
        this.solarPanel2 = this.solarPanels[1]
        this.solarPanel3 = this.solarPanels[2]
        this.solarPanel4 = this.solarPanels[3]
        this.solarPanel5 = this.solarPanels[4]
        this.solarPanel6 = this.solarPanels[5]
        this.solarPanel7 = this.solarPanels[6]
        this.solarPanel8 = this.solarPanels[7]
        
    }

    changeRotation(){
        this.solarPanel1.rotation.z = Math.PI/6
        this.solarPanel2.rotation.z = Math.PI/8
        this.solarPanel6.rotation.z = Math.PI/7
        this.solarPanel4.rotation.z = Math.PI/6
        this.solarPanel5.rotation.z = Math.PI/5
        this.solarPanel6.rotation.z = Math.PI/4
        this.solarPanel7.rotation.z = Math.PI/3
        this.solarPanel8.rotation.z = Math.PI/2
    }

    getPanel(name:string,meshes:BABYLON.AbstractMesh[]){
        let parentMesh = null
        for (const mesh of meshes) {
            if(mesh.name.includes(name)){
                if(!parentMesh){
                    parentMesh = mesh
                }
                else {
                    mesh.setParent(parentMesh)
                }
            }
        }
        if(parentMesh){
            // parentMesh.rotation.z = Math.PI/4
            return parentMesh
        }
    }
    

    onRender(){

    }
}

export default MainScene