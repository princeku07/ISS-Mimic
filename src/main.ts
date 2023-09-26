import { Engine,Scene } from "@babylonjs/core";
import MainScene from "./pages/MainScene";

const canvas = document.getElementById("renderCanvas")
const engine = new Engine(canvas)
const scene = new Scene(engine)

  const mainScene = new MainScene(scene)
engine.runRenderLoop(() =>{
  mainScene.onRender()
  scene.render()

})

window.addEventListener("resize", () => {
  engine.resize()
})