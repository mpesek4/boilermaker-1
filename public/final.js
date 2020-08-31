import * as BABYLON from 'babylonjs'
import 'babylonjs-materials'

console.log('hlelo')
window.addEventListener('DOMContentLoaded', function() {
  console.log('hlelo')
  // get the canvas DOM element
  var canvas = document.getElementById('renderCanvas')

  // load the 3D engine
  var engine = new BABYLON.Engine(canvas, true)

  // createScene function that creates and return the scene
  var createScene = function() {
    var scene = new BABYLON.Scene(engine)
    // scene.clearColor = BABYLON.Color3.Purple();

    var camera = new BABYLON.FreeCamera(
      'Camera',
      new BABYLON.Vector3(0, 0, -20),
      scene
    )
    camera.attachControl(canvas, true)
    camera.checkCollisions = true
    // camera.applyGravity = true;
    camera.setTarget(new BABYLON.Vector3(0, 0, 0))

    var light = new BABYLON.DirectionalLight(
      'dir02',
      new BABYLON.Vector3(0.2, -1, 0),
      scene
    )
    light.position = new BABYLON.Vector3(0, 80, 0)

    // Material
    var materialAmiga = new BABYLON.StandardMaterial('amiga', scene)
    materialAmiga.diffuseTexture = new BABYLON.Texture(
      'textures/amiga.jpg',
      scene
    )
    materialAmiga.emissiveColor = new BABYLON.Color3(0.23, 0.29, 0.55)
    materialAmiga.diffuseTexture.uScale = 5
    materialAmiga.diffuseTexture.vScale = 5

    var materialAmiga2 = new BABYLON.StandardMaterial('amiga', scene)
    materialAmiga2.diffuseTexture = new BABYLON.Texture(
      'textures/amiga.jpg',
      scene
    )
    materialAmiga2.emissiveColor = new BABYLON.Color3(0.25, 0.53, 0.6)

    var materialWood = new BABYLON.StandardMaterial('wood', scene)
    materialWood.diffuseTexture = new BABYLON.Texture(
      'textures/crate.png',
      scene
    )
    materialWood.emissiveColor = new BABYLON.Color3(0.5, 0.5, 0.5)

    // Shadows
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, light)

    // Physics
    // scene.enablePhysics(null, new BABYLON.CannonJSPlugin());
    scene.collisionsEnabled = true
    scene.enablePhysics(null, new BABYLON.OimoJSPlugin())

    var dummyBox = BABYLON.Mesh.CreateSphere('Sphere0', 16, 3, scene)
    dummyBox.checkCollisions = true
    BABYLON.SceneLoader.ImportMesh(
      '',
      'https://models.babylonjs.com/',
      'shark.glb',
      scene,
      function(sharkMesh) {
        var shark = sharkMesh[0]
        console.log('shark is', shark)
        // selecting the mesh we will animate later on scene.registerBeforeRender()

        // shark.position= new BABYLON.Vector3(150, -20, 150);

        // shark.parent = dummyBox

        // dummyBox.parent = camera
        // shark.parent = dummyBox
        dummyBox.parent = camera
        shark.parent = dummyBox
        console.log('shark parent is', shark.parent)
        dummyBox.position = new BABYLON.Vector3(0, -5, 20)
        dummyBox.material = materialWood
        dummyBox.checkCollisions = true
      }
    )

    // Spheres

    var y = 0
    let spheres = []
    for (var index = 0; index < 100; index++) {
      var sphere = BABYLON.Mesh.CreateSphere('Sphere0', 16, 10, scene)
      sphere.material = materialAmiga

      // if(index > 50)sphere.material = materialWood
      if (index > 1)
        sphere.position = new BABYLON.Vector3(
          Math.random() * 20 - 10,
          y,
          Math.random() * 10 - 5
        )
      // sphere.position = new BABYLON.Vector3(Math.random() * 20 - 10, y, Math.random() * 10 - 5);

      // shadowGenerator.addShadowCaster(sphere);

      sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
        sphere,
        BABYLON.PhysicsImpostor.SphereImpostor,
        {mass: 1},
        scene
      )
      spheres.push(sphere)
      sphere.checkCollisions = true
      y += 2
    }

    let sphereIds = []
    for (sphere of spheres) {
      sphere.actionManager = new BABYLON.ActionManager(scene)

      sphere.actionManager.registerAction(
        new BABYLON.SetValueAction(
          {
            trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
            parameter: dummyBox
          },
          sphere,
          'material',
          materialWood
        )
      )

      sphere.actionManager.registerAction(
        new BABYLON.SetValueAction(
          {
            trigger: BABYLON.ActionManager.OnIntersectionExitTrigger,
            parameter: dummyBox
          },
          sphere,
          'scaling',
          new BABYLON.Vector3(1, 1, 1)
        )
      )
    }

    // camera.onCollide = function(collidedMesh) {
    //     let idx = sphereIds.indexOf(collidedMesh.uniqueId)

    //     console.log("found an index", collidedMesh.uniqueId)

    //     // let currSphere = spheres[idx]
    //     // currSphere.material = materialWood

    //         // if(collidedMesh.uniqueId === sphere.uniqueId) {
    //         //     sphere.material = materialWood
    //         //     console.log("hello sphere")

    //     }
    //     console.log("doc", camera.onCollide)

    // Box
    var box0 = BABYLON.Mesh.CreateBox('Box0', 3, scene)
    box0.position = new BABYLON.Vector3(3, 30, 0)

    box0.material = materialWood

    shadowGenerator.addShadowCaster(box0)

    // Compound
    var part0 = BABYLON.Mesh.CreateBox('part0', 3, scene)
    part0.position = new BABYLON.Vector3(3, 30, 0)
    part0.material = materialWood

    var part1 = BABYLON.Mesh.CreateBox('part1', 3, scene)
    part1.parent = part0 // We need a hierarchy for compound objects
    part1.position = new BABYLON.Vector3(0, 3, 0)
    part1.material = materialWood

    shadowGenerator.addShadowCaster(part0)
    shadowGenerator.addShadowCaster(part1)
    shadowGenerator.useBlurExponentialShadowMap = true
    shadowGenerator.useKernelBlur = true
    shadowGenerator.blurKernel = 32

    // Playground
    var ground = BABYLON.Mesh.CreateBox('Ground', 5, scene)
    ground.scaling = new BABYLON.Vector3(500, 1, 500)
    ground.position.y = -5.0
    // ground.checkCollisions = true;
    console.log('ground id is', ground.uniqueId)

    var border0 = BABYLON.Mesh.CreateBox('border0', 1, scene)
    border0.scaling = new BABYLON.Vector3(1, 300, 300)
    border0.position.y = -5.0
    border0.position.x = -250.0
    border0.checkCollisions = true
    border0.setEnabled(false)

    var border1 = BABYLON.Mesh.CreateBox('border1', 1, scene)
    border1.scaling = new BABYLON.Vector3(1, 300, 300)
    border1.position.y = -5.0
    border1.position.x = 250.0
    border1.checkCollisions = true
    border1.setEnabled(false)

    var border2 = BABYLON.Mesh.CreateBox('border2', 1, scene)
    border2.scaling = new BABYLON.Vector3(300, 300, 1)
    border2.position.y = -5.0
    border2.position.z = 250.0
    border2.checkCollisions = true
    border2.setEnabled(false)

    var border3 = BABYLON.Mesh.CreateBox('border3', 1, scene)
    border3.scaling = new BABYLON.Vector3(300, 300, 1)
    border3.position.y = -5.0
    border3.position.z = -250.0
    border3.checkCollisions = true
    border3.setEnabled(false)

    var groundTexture = new BABYLON.Texture(
      '//www.babylonjs.com/assets/sand.jpg',
      scene
    )
    groundTexture.vScale = groundTexture.uScale = 4.0

    var groundMaterial = new BABYLON.StandardMaterial('groundMaterial', scene)
    groundMaterial.diffuseTexture = groundTexture
    ground.material = groundMaterial

    // border0.material = groundMaterial;
    // border1.material = groundMaterial;
    // border2.material = groundMaterial;
    // border3.material = groundMaterial;
    ground.receiveShadows = true

    var waterMaterial = new BABYLON.WaterMaterial(
      'waterMaterial',
      scene,
      new BABYLON.Vector2(512, 512)
    )
    waterMaterial.bumpTexture = new BABYLON.Texture(
      '//www.babylonjs.com/assets/waterbump.png',
      scene
    )
    waterMaterial.windForce = -10
    waterMaterial.waveHeight = 0.5
    waterMaterial.bumpHeight = 0.1
    waterMaterial.waveLength = 0.1
    waterMaterial.waveSpeed = 50.0
    waterMaterial.colorBlendFactor = 0
    waterMaterial.windDirection = new BABYLON.Vector2(1, 1)
    waterMaterial.colorBlendFactor = 0

    var waterMesh = BABYLON.Mesh.CreateGround(
      'waterMesh',
      512,
      512,
      32,
      scene,
      false
    )
    waterMesh.material = waterMaterial

    waterMaterial.addToRenderList(ground)
    // waterMaterial.addToRenderList(border0);
    // waterMaterial.addToRenderList(border1);
    // waterMaterial.addToRenderList(border2);
    // waterMaterial.addToRenderList(border3);

    // Skybox
    var skybox = BABYLON.Mesh.CreateBox('skyBox', 1000.0, scene)
    var skyboxMaterial = new BABYLON.StandardMaterial('skyBox', scene)
    skyboxMaterial.backFaceCulling = false
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      'textures/skybox',
      scene
    )
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0)
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
    skyboxMaterial.disableLighting = true
    skybox.material = skyboxMaterial

    // Physics
    box0.physicsImpostor = new BABYLON.PhysicsImpostor(
      box0,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 2, friction: 0.4, restitution: 0.3},
      scene
    )
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(
      ground,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 0, friction: 0.5, restitution: 0.7},
      scene
    )
    border0.physicsImpostor = new BABYLON.PhysicsImpostor(
      border0,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 0},
      scene
    )
    border1.physicsImpostor = new BABYLON.PhysicsImpostor(
      border1,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 0},
      scene
    )
    border2.physicsImpostor = new BABYLON.PhysicsImpostor(
      border2,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 0},
      scene
    )
    border3.physicsImpostor = new BABYLON.PhysicsImpostor(
      border3,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 0},
      scene
    )

    part0.physicsImpostor = new BABYLON.PhysicsImpostor(
      part0,
      BABYLON.PhysicsImpostor.BoxImpostor,
      {mass: 2, friction: 0.4, restitution: 0.3},
      scene
    )

    return scene
  }

  // call the createScene function
  var scene = createScene()

  // run the render loop
  engine.runRenderLoop(function() {
    scene.render()
  })

  // the canvas/window resize event handler
  window.addEventListener('resize', function() {
    engine.resize()
  })
})
