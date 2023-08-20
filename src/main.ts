import { Engine,Scene } from "@babylonjs/core";
import MainScene from "./pages/MainScene";

const canvas = document.getElementById("renderCanvas")
const engine = new Engine(canvas)
const scene = new Scene(engine)

new MainScene(scene)
engine.runRenderLoop(() =>{
  scene.render()
})

window.addEventListener("resize", () => {
  engine.resize()
})