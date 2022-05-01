// ░█████╗░██╗██████╗░██████╗░██████╗░░█████╗░██████╗░░ ██████╗░░█████╗░░█████╗░██╗███╗░░██╗░██████╗░
// ██╔══██╗██║██╔══██╗██╔══██╗██╔══██╗██╔══██╗██╔══██╗ ██╔══██╗██╔══██╗██╔══██╗██║████╗░██║██╔════╝░
// ███████║██║██████╔╝██║░░██║██████╔╝██║░░██║██████╔╝ ██████╔╝███████║██║░░╚═╝██║██╔██╗██║██║░░██╗░
// ██╔══██║██║██╔══██╗██║░░██║██╔══██╗██║░░██║██╔═══╝░░██╔══██╗██╔══██║██║░░██╗██║██║╚████║██║░░╚██╗
// ██║░░██║██║██║░░██║██████╔╝██║░░██║╚█████╔╝██║░░░░░ ██║░░██║██║░░██║╚█████╔╝██║██║░╚███║╚██████╔╝
// ╚═╝░░╚═╝╚═╝╚═╝░░╚═╝╚═════╝░╚═╝░░╚═╝░╚════╝░╚═╝░░░░░ ╚═╝░░╚═╝╚═╝░░╚═╝░╚════╝░╚═╝╚═╝░░╚══╝░╚═════╝░

  // ░█▀▀█ ░█─░█ ─█▀▀█ ░█▀▀█ ▀▀█▀▀ ░█▀▀▀ ░█▀▀█ ░█▀▀▀█ 
  // ░█─── ░█▀▀█ ░█▄▄█ ░█▄▄█ ─░█── ░█▀▀▀ ░█▄▄▀ ─▀▀▀▄▄ 
  // ░█▄▄█ ░█─░█ ░█─░█ ░█─── ─░█── ░█▄▄▄ ░█─░█ ░█▄▄▄█

      //  1. Introduction & Imports
      //  2. Calling Car Entites
      //  3. Setting up World
      //  4. Creating CANNON Entities & Contact Materials
      //  IMPLEMENTATION OF RACE TRACK

import { addOneTimeTrigger, getEntityWorldPosition } from '@dcl/ecs-scene-utils'
import { movePlayerTo } from '@decentraland/RestrictedActions'



// Car entities
        const chassis: Entity = new Entity()
        chassis.addComponent(new GLTFShape("models/carBody.glb"))
        chassis.addComponent(new Transform())
        engine.addEntity(chassis)

        const wheels: Entity[] = []
        const wheelPositions: Vector3[] = [new Vector3(2, 1.5, 0), new Vector3(2, -1.5, 0), new Vector3(-2.1, 1.5, 0), new Vector3(-2.1, -1.5, 0)]

        for (let i = 0; i < wheelPositions.length; i++) {
          const wheel: Entity = new Entity()
          if (i % 2 == 0) {
            wheel.addComponent(new GLTFShape("models/carWheelRight.glb"))
          } else {
            wheel.addComponent(new GLTFShape("models/carWheelLeft.glb"))
          }

          wheel.addComponent(new Transform({ position: wheelPositions[i] }))
          engine.addEntity(wheel)
          wheels.push(wheel)
        }

// Setup our world
        const world: CANNON.World = new CANNON.World()
        world.broadphase = new CANNON.SAPBroadphase(world)
        world.gravity.set(0, -9.82, 0) // m/s²
        world.defaultContactMaterial.friction = 0

        const groundMaterial: CANNON.Material = new CANNON.Material("groundMaterial")
        const wheelMaterial: CANNON.Material = new CANNON.Material("wheelMaterial")
        const wheelGroundContactMaterial: CANNON.ContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
          friction: 0.3,
          restitution: 0,
          contactEquationStiffness: 1000,
        })

        const boxMaterial: CANNON.Material = new CANNON.Material("boxMaterial")
        const boxToGroundContactMaterial: CANNON.ContactMaterial = new CANNON.ContactMaterial(groundMaterial, boxMaterial, {
          friction: 0.25,
          restitution: 0,
        })
        const boxToBoxContactMaterial: CANNON.ContactMaterial = new CANNON.ContactMaterial(boxMaterial, boxMaterial, {
          friction: 0.25,
          restitution: 0,
        })
        world.addContactMaterial(boxToGroundContactMaterial)
        world.addContactMaterial(boxToBoxContactMaterial)



// Create CANNON bodies to represent each box


      // We must add the contact materials to the world
      world.addContactMaterial(wheelGroundContactMaterial)

      // Create a ground plane and apply physics material
      const groundBody: CANNON.Body = new CANNON.Body({
        mass: 0, // mass == 0 makes the body static
      })
      groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2) // Reorient ground plane to be in the y-axis

      const groundShape: CANNON.Plane = new CANNON.Plane()
      groundBody.addShape(groundShape)
      groundBody.material = groundMaterial
      world.addBody(groundBody)

      const chassisShape: CANNON.Box = new CANNON.Box(new CANNON.Vec3(7.2 / 2, 3.3 / 2, 1.7 / 2)) // Dimensions is from the center
      const chassisBody: CANNON.Body = new CANNON.Body({ mass: 150 })
      chassisBody.addShape(chassisShape)
      chassisBody.position.set(67,4,-21.46) // Start position in scene
      chassisBody.angularVelocity.set(-2, 0.0, 2)

      const options = {
        radius: 0.5, // m
        directionLocal: new CANNON.Vec3(0, 0, -1),
        suspensionStiffness: 30,
        suspensionRestLength: 0.4,
        frictionSlip: 5,
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence: 0.01,
        axleLocal: new CANNON.Vec3(0, 1, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(1, 1, 0),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true,
      }

      // Create the vehicle
      const vehicle: CANNON.RaycastVehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody,
})

      // Set the wheel bodies positions
      for (let i = 0; i < wheelPositions.length; i++) {
        options.chassisConnectionPointLocal.set(wheelPositions[i].clone().x, wheelPositions[i].clone().y, wheelPositions[i].clone().z)
        vehicle.addWheel(options)
      }
      vehicle.addToWorld(world)

      const wheelBodies: CANNON.Body[] = []

      var Group1;
      var Group2;

      for (let i = 0; i < vehicle.wheelInfos.length; i++) {
        let wheel = vehicle.wheelInfos[i]
        let cylinderShape: CANNON.Sphere = new CANNON.Sphere(0.5)
        let wheelBody: CANNON.Body = new CANNON.Body({
          mass: 10,
        })
        wheelBody.type = CANNON.Body.DYNAMIC
        wheelBody.collisionFilterGroup = Group1 // turn off collisions
        wheelBody.collisionFilterMask = Group2
        let q: CANNON.Quaternion = new CANNON.Quaternion()
        q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), Math.PI / 2)
        wheelBody.addShape(cylinderShape)
        wheelBodies.push(wheelBody)
        world.addBody(wheelBody)
      }

      const fixedTimeStep: number = 1.0 / 60.0 // seconds
      const maxSubSteps: number = 3

      class updateSystem implements ISystem {
        update(dt: number): void {
          // Instruct the world to perform a single step of simulation.
          // It is generally best to keep the time step and iterations fixed.
          world.step(fixedTimeStep, dt, maxSubSteps)

          for (let i = 0; i < vehicle.wheelInfos.length; i++) {
            vehicle.updateWheelTransform(i)
            let t: CANNON.Transform = vehicle.wheelInfos[i].worldTransform
            let wheelBody: CANNON.Body = wheelBodies[i]
            wheelBody.position.copy(t.position)
            wheelBody.quaternion.copy(t.quaternion)
            wheels[i].getComponent(Transform).position.copyFrom(wheelBodies[i].position)
            wheels[i].getComponent(Transform).rotation.copyFrom(wheelBodies[i].quaternion)
          }

          // Modifying the wheels position and rotation needs to happen before the chassis
          chassis.getComponent(Transform).position.copyFrom(chassisBody.position)
          chassis.getComponent(Transform).rotation.copyFrom(chassisBody.quaternion)
        }
      }

      engine.addSystem(new updateSystem())

      let forwardForce: number = 0.0
      let backwardForce: number = 0.0
      let steerValue: number = 0.0
      const maxSteerValue: number = 0.5
      const maxSpeed: number = 700
      const brakeForce: number = 25
      let speed: number = 0


      class updateDriveSystem implements ISystem {
        update(): void {
          // Forward force
          vehicle.applyEngineForce(forwardForce, 2)
          vehicle.applyEngineForce(forwardForce, 3)

          // Steering
          vehicle.setSteeringValue(steerValue, 0)
          vehicle.setSteeringValue(steerValue, 1)

          // Braking
          // Press E and F Keys together
          if (spaceKeyPressed) {
            vehicle.setBrake(brakeForce, 0)
            vehicle.setBrake(brakeForce, 1)
            vehicle.setBrake(brakeForce, 2)
            vehicle.setBrake(brakeForce, 3)
            vehicle.setBrake(brakeForce, 4)
            vehicle.setBrake(brakeForce, 5)
            vehicle.setBrake(brakeForce, 6)
            speed = 0
          } else {
            vehicle.setBrake(0, 0)
            vehicle.setBrake(0, 1)
            vehicle.setBrake(0, 2)
            vehicle.setBrake(0, 3)
          }
        }
      }
      engine.addSystem(new updateDriveSystem())

      // Controls
      const input = Input.instance

      let isPointerPressed = false
      let isEKeyPressed = false
      let isFKeyPressed = false
      let isEKeyReleased = false
      let isFKeyReleased = false
      let spaceKeyPressed = false
      let spaceKeyReleased = false
      let shiftKeyPressed = false
      let shiftKeyReleased = false

      // Pointer
      input.subscribe("BUTTON_DOWN", ActionButton.ACTION_4, false, () => {
        isPointerPressed = true
      })
      input.subscribe("BUTTON_UP", ActionButton.ACTION_4, false, () => {
        isPointerPressed = false
      })

      // LEFT Key
      input.subscribe("BUTTON_DOWN", ActionButton.ACTION_3, false, () => {
        isEKeyPressed = true
        isEKeyReleased = false
      })
      input.subscribe("BUTTON_UP", ActionButton.ACTION_3, false, () => {
        isEKeyPressed = false
        isEKeyReleased = true
      })

      // Right Key
      input.subscribe("BUTTON_DOWN", ActionButton.ACTION_5, false, () => {
        isFKeyPressed = true
        isFKeyReleased = false
      })
      input.subscribe("BUTTON_UP", ActionButton.ACTION_5, false, () => {
        isFKeyPressed = false
        isFKeyReleased = true
      })

      //Space Key
      input.subscribe("BUTTON_DOWN", ActionButton.JUMP, false, () => {
        spaceKeyPressed = true
        spaceKeyReleased = false
      })
      input.subscribe("BUTTON_UP", ActionButton.JUMP, false, () => {
        spaceKeyPressed = false
        spaceKeyReleased = true
      })

      //Shift Key
      input.subscribe("BUTTON_DOWN", ActionButton.WALK, false, () => {
        shiftKeyPressed = true
        shiftKeyReleased = false
      })
      input.subscribe("BUTTON_UP", ActionButton.WALK, false, () => {
        shiftKeyPressed = false
        shiftKeyReleased = true
      })

      class ButtonChecker {
        update(dt: number) {
          if (isPointerPressed) {
            // Accelerate
            if (forwardForce > -maxSpeed) forwardForce -= 300 * dt
            speed += 300 * dt/5
            if (speed > 338){
              speed = 330
            }else{
              speed+(speed/8)
            }
            log(forwardForce)
          } if (isPointerPressed ==false && shiftKeyPressed == false) {
            // Decelerate
            if (forwardForce < 0) {
              forwardForce += 300 * dt
            } else {
              forwardForce = 0
            }
          }

          if (shiftKeyPressed) {
            // Accelerate
            if (forwardForce < maxSpeed/2) forwardForce += 100 * dt
          
            log(forwardForce)
            
          } if(shiftKeyPressed == false && isPointerPressed == false) {
            // Decelerate
            if (forwardForce > 0) {
              forwardForce -= 300 * dt
            } else {
              forwardForce = 0
              
              }
            }
          
          

          if (isEKeyPressed && steerValue > -maxSteerValue) {
            log(steerValue)
            steerValue -= 3 * dt
          }

          if (isEKeyReleased && steerValue < 0) {
            log(steerValue)
            steerValue += 1.5 * dt
          }
          if (isFKeyPressed && steerValue < maxSteerValue) {
            steerValue += 3 * dt
          }
          if (isFKeyReleased && steerValue > 0) {
            log(steerValue)
            steerValue -= 1.5 * dt
            if(isFKeyReleased && steerValue < 0){
              steerValue = 0
            }
          }
        }
      }

      engine.addSystem(new ButtonChecker())


            //YOUR CHANGES
            const tracker = new Entity()
            engine.addEntity(tracker)
            tracker.setParent(chassis)
      
            const gizmo = new Entity()
            gizmo.addComponent(new GLTFShape('models/Car_HoodGizmo_1.glb'))
            engine.addEntity(gizmo)
            gizmo.setParent(chassis)
            gizmo.addComponent(new Transform())
            gizmo.getComponent(Transform).position.set(80, 1.8, 5)
      
      
                //Player Movement system
                export class mover implements ISystem {
      
                    private movement: number = 0
      
                    update(dt: number) {
                        this.movement += dt
                        message.value = (Math.round(speed) + 'm/s')
                        movePlayerTo(getEntityWorldPosition(tracker),getEntityWorldPosition(gizmo))
                    }
                }
                engine.addSystem(new mover())
      
                const canvas = new UICanvas()
      
                  const message = new UIText(canvas)
                  message.fontSize = 35
                  message.width = 60
                  message.height = 60
                  message.vAlign = "bottom"
                  message.hAlign = "left"
                  message.paddingLeft = 30
                  message.paddingBottom = 30
                  message.color = Color4.Red()
                
                //modifier areas
                const hideAV = new Entity()
                hideAV.addComponent(
                  new AvatarModifierArea({
                    area: { box: new Vector3(16, 8, 16) },
                    modifiers: [AvatarModifiers.HIDE_AVATARS],
                  })
                )
                hideAV.setParent(tracker)
                engine.addEntity(hideAV)
      
                // //MODIFIER AREA FIRST PERSON
                // const firstperson = new Entity()
                // firstperson.addComponent(
                //   new CameraModeArea({
                //     area: { box: new Vector3(16, 16, 14) },
                //     cameraMode: CameraMode.FirstPerson,
                //   })
                // )
                // firstperson.setParent(tracker)
                // engine.addEntity(firstperson)

               

            //IMPLEMENTATION OF RACE TRACK [TRACK 1 - JOY]

          //ʀᴀᴄᴇ ᴛʀᴀᴄᴋ ᴄʀᴇᴀᴛɪᴏɴ
            //The first implementation attempt shall include a multitude of small 2x2 colliders boxes.
            // An important note in development; it is seemingly important to see the outer and inner walls as
            // two seperately constructed pieces. This will allow you to draft two 1YAXis stenciles before building upwards.
            // This aims to be the first step towards build modularity, as the build will follow the X/Z Start Positions 
            // in a relative manner.


            // Store boxes
            const cubes: Entity[] = [] 

            // Store box bodies
            const cubeBodies: CANNON.Body[] = []

            // Start position for the boxes
            let cubeOuterXPosition: number = -60
            let cubeHeightPosition: number = 0
            let cubeOuterZPosition: number = 60
            let cubeStartSize: 1.25
            let cubeStartHeight: 2
            

            const blueCubeMaterial = new Material()
            blueCubeMaterial.roughness = 0.5
            blueCubeMaterial.albedoColor = Color3.FromInts(98, 50.2, 44.7)

            const blackCubeMaterial: Material = new Material()
            blackCubeMaterial.roughness = 0.5
            blackCubeMaterial.albedoColor = Color3.FromInts(0, 162, 190)

            const CubeColorShift: Material = new Material()
            let colorshiftR = 0
            let colorshiftCounter = 0
            let colorshiftG = 0
            CubeColorShift.albedoColor = Color3.FromInts(colorshiftR,0,0)

            
            
            //TRACK'S OUTER RING  ╭━━━┳━━━╮
            //TRACK'S OUTER RING  ┃╭━╮┃╭━╮┃
            //TRACK'S OUTER RING  ┃┃╱┃┃╰━╯┃
            //TRACK'S OUTER RING  ┃┃╱┃┃╭╮╭╯ 
            //TRACK'S OUTER RING  ┃╰━╯┃┃┃╰╮
            //TRACK'S OUTER RING  ╰━━━┻╯╰━╯ 
            // .--.      .-'.      .--.      .--.      .--.      .--.      .`-.      .--.
            // :::::.\::::::::.\::::::::.\::::::::.\::::::::.\::::::::.\::::::::.\::::::::.\
            // '      `--'      `.-'      `--'      `--'      `--'      `-.'      `--'      `
              
                
                // ██╗░░░░░░░███╗░░
                // ██║░░░░░░████║░░
                // ██║░░░░░██╔██║░░
                // ██║░░░░░╚═╝██║░░
                // ███████╗███████╗
                // ╚══════╝╚══════╝
                //A straight line, going across the X axis, from left to right.
                for (let i = 0; i < 2; i++) {
                  for (let j = 0; j < 50; j++) {
                    let cubepositionX: number = cubeOuterXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeOuterZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    //Change Variables to move along X axis
                    cubeOuterXPosition += 2
                  }
                  
                  // ██████╗░░░███╗░░
                  // ██╔══██╗░████║░░
                  // ██████╦╝██╔██║░░
                  // ██╔══██╗╚═╝██║░░
                  // ██████╦╝███████╗
                  // ╚═════╝░╚══════╝
                  //OUTER BEND CODE || 𝕞𝕠𝕕𝕦𝕝𝕒𝕣 BEND 1
                  //Outer Lip Extension
                  for(let j=0; j<7; j++){
                    let cubepositionX: number = cubeOuterXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeOuterZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    //Change Variables to move along X axis
                    cubeOuterXPosition += 2
                  }

                  //x3 2x2 Boxes Bend
                  for(let j=0; j<3; j++){
                  for(let j=0; j<2; j++){
                    let cubepositionX: number = cubeOuterXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeOuterZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    cubeOuterXPosition += 2
                  }
                  cubeOuterZPosition -= 2
                }

                  //x6 1x1 Boxes Bend
                  for(let j=0; j<6; j++){
                    let cubepositionX: number = cubeOuterXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeOuterZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    cubeOuterXPosition += 2
                    cubeOuterZPosition -= 2
                  }

                  //x3 2x2 Boxes Second Bend
                  for(let j=0; j<3; j++){
                    for(let j=0; j<2; j++){
                      let cubepositionX: number = cubeOuterXPosition
                      let cubepositionY: number = cubeHeightPosition
                      let cubepositionZ: number = cubeOuterZPosition
        
                      const cube: Entity = new Entity()
                      cube.addComponent(new BoxShape())
                      cube.addComponent(
                        new Transform({
                          position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                          rotation: new Quaternion(35,0,220,0),
                          scale: new Vector3(1.25, 1.25, 1.25),
                        })
                      )
                      cube.addComponent(blueCubeMaterial)
                      engine.addEntity(cube)
                      cubes.push(cube)
                      cubeOuterZPosition -= 2
                    }
                    cubeOuterXPosition += 2
                  }

                  //Final Lip
                  for(let j=0; j<7; j++){
                    let cubepositionX: number = cubeOuterXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeOuterZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    cubeOuterZPosition -= 2
                  }

                  //Long Stretch
                    for (let j = 0; j < 50; j++) {
                      let cubepositionX: number = cubeOuterXPosition
                      let cubepositionY: number = cubeHeightPosition
                      let cubepositionZ: number = cubeOuterZPosition
        
                      const cube: Entity = new Entity()
                      cube.addComponent(new BoxShape())
                      cube.addComponent(
                        new Transform({
                          position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                          rotation: new Quaternion(35,0,220,0),
                          scale: new Vector3(1.25, 1.25, 1.25),
                        })
                      )
                      cube.addComponent(blueCubeMaterial)
                      engine.addEntity(cube)
                      cubes.push(cube)
                      //Change Variables to move along Z axis
                      cubeOuterZPosition -= 2
                    }



                  // ██████╗░██████╗░
                  // ██╔══██╗╚════██╗
                  // ██████╦╝░░███╔═╝
                  // ██╔══██╗██╔══╝░░
                  // ██████╦╝███████╗
                  // ╚═════╝░╚══════╝
                  //BEND 2
                  //OUTER BEND CODE || 𝕞𝕠𝕕𝕦𝕝𝕒𝕣 BEND 2
                      //Outer Lip Extension
                      for(let j=0; j<7; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        //Change Variables to move along X axis
                        cubeOuterZPosition -=2
                      }

                      //x3 2x2 Boxes Bend
                      for(let j=0; j<3; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeOuterXPosition -= 2
                      }
                      cubeOuterZPosition -= 2
                    }

                      //x6 1x1 Boxes Bend
                      for(let j=0; j<6; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeOuterXPosition -= 2
                        cubeOuterZPosition -= 2
                      }

                      //x3 2x2 Boxes Second Bend
                      for(let j=0; j<3; j++){
                        for(let j=0; j<2; j++){
                          let cubepositionX: number = cubeOuterXPosition
                          let cubepositionY: number = cubeHeightPosition
                          let cubepositionZ: number = cubeOuterZPosition
            
                          const cube: Entity = new Entity()
                          cube.addComponent(new BoxShape())
                          cube.addComponent(
                            new Transform({
                              position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                              rotation: new Quaternion(35,0,220,0),
                              scale: new Vector3(1.25, 1.25, 1.25),
                            })
                          )
                          cube.addComponent(blueCubeMaterial)
                          engine.addEntity(cube)
                          cubes.push(cube)
                          cubeOuterXPosition -= 2
                        }
                        cubeOuterZPosition -= 2
                      }
                      //Final Lip Extension
                      for(let j=0; j<7; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        //Change Variables to move along X axis
                        cubeOuterXPosition -=2
                      }


                  //Long Stretch
                  for (let j = 0; j < 50; j++) {
                    let cubepositionX: number = cubeOuterXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeOuterZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    //Change Variables to move along X axis
                    cubeOuterXPosition -= 2
                  }

                  // ██████╗░██████╗░
                  // ██╔══██╗╚════██╗
                  // ██████╦╝░█████╔╝
                  // ██╔══██╗░╚═══██╗
                  // ██████╦╝██████╔╝
                  // ╚═════╝░╚═════╝░
                  //BEND 3
                  //OUTER BEND CODE || 𝕞𝕠𝕕𝕦𝕝𝕒𝕣 BEND 3
                      //Outer Lip Extension
                      for(let j=0; j<7; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        //Change Variables to move along X axis
                        cubeOuterXPosition -=2
                      }

                      //x3 2x2 Boxes Bend
                      for(let j=0; j<3; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeOuterXPosition -= 2
                      }
                      cubeOuterZPosition += 2
                    }

                      //x6 1x1 Boxes Bend
                      for(let j=0; j<6; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeOuterXPosition -= 2
                        cubeOuterZPosition += 2
                      }

                      //x3 2x2 Boxes Second Bend
                      for(let j=0; j<3; j++){
                        for(let j=0; j<2; j++){
                          let cubepositionX: number = cubeOuterXPosition
                          let cubepositionY: number = cubeHeightPosition
                          let cubepositionZ: number = cubeOuterZPosition
            
                          const cube: Entity = new Entity()
                          cube.addComponent(new BoxShape())
                          cube.addComponent(
                            new Transform({
                              position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                              rotation: new Quaternion(35,0,220,0),
                              scale: new Vector3(1.25, 1.25, 1.25),
                            })
                          )
                          cube.addComponent(blueCubeMaterial)
                          engine.addEntity(cube)
                          cubes.push(cube)
                          cubeOuterXPosition -= 2
                        }
                        cubeOuterZPosition += 2
                      }

                      //Final Lip Extension
                      for(let j=0; j<7; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        //Change Variables to move along X axis
                        cubeOuterZPosition +=2
                      }

                      //Long Stretch
                  for (let j = 0; j < 54; j++) {
                    let cubepositionX: number = cubeOuterXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeOuterZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    //Change Variables to move along X axis
                    cubeOuterZPosition += 2
                  }

                  // ██████╗░░░██╗██╗
                  // ██╔══██╗░██╔╝██║
                  // ██████╦╝██╔╝░██║
                  // ██╔══██╗███████║
                  // ██████╦╝╚════██║
                  // ╚═════╝░░░░░░╚═╝
                  //BEND 4
                  //OUTER BEND CODE || 𝕞𝕠𝕕𝕦𝕝𝕒𝕣 OUTER BEND 4
                      //Outer Lip Extension
                      for(let j=0; j<7; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        //Change Variables to move along X axis
                        cubeOuterZPosition +=2
                      }

                      //x3 2x2 Boxes Bend
                      for(let j=0; j<3; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeOuterXPosition += 2
                      }
                      cubeOuterZPosition += 2
                    }

                      //x6 1x1 Boxes Bend
                      for(let j=0; j<6; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeOuterXPosition += 2
                        cubeOuterZPosition += 2
                      }

                      //x3 2x2 Boxes Second Bend
                      for(let j=0; j<3; j++){
                        for(let j=0; j<2; j++){
                          let cubepositionX: number = cubeOuterXPosition
                          let cubepositionY: number = cubeHeightPosition
                          let cubepositionZ: number = cubeOuterZPosition
            
                          const cube: Entity = new Entity()
                          cube.addComponent(new BoxShape())
                          cube.addComponent(
                            new Transform({
                              position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                              rotation: new Quaternion(35,0,220,0),
                              scale: new Vector3(1.25, 1.25, 1.25),
                            })
                          )
                          cube.addComponent(blueCubeMaterial)
                          engine.addEntity(cube)
                          cubes.push(cube)
                          cubeOuterXPosition += 2
                        }
                        cubeOuterZPosition += 2
                      }

                      //Final Lip Extension
                      for(let j=0; j<7; j++){
                        let cubepositionX: number = cubeOuterXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeOuterZPosition

                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        //Change Variables to move along X axis
                        cubeOuterXPosition +=2
                      }
                    //LAYER 1 COMPLETE
                    //AUTOMATIC MOVEMENT TO LAYER 2
                    //Change in variables to move along the Y Axis
                    cubeOuterXPosition = -60
                    cubeOuterZPosition = 60
                    cubeHeightPosition += 2 // To ensure the colliders aren't intersecting when the simulation starts
                  }

                  //Set CubeHeight to 0
                  cubeHeightPosition = 0


                  //INNER RING ╭━━┳━━━╮
                  //INNER RING ╰┫┣┫╭━╮┃
                  //INNER RING ╱┃┃┃╰━╯┃
                  //INNER RING ╱┃┃┃╭╮╭╯
                  //INNER RING ╭┫┣┫┃┃╰╮
                  //INNER RING ╰━━┻╯╰━╯
                  // .--.      .-'.      .--.      .--.      .--.      .--.      .`-.      .--.
                  // :::::.\::::::::.\::::::::.\::::::::.\::::::::.\::::::::.\::::::::.\::::::::.\
                  // '      `--'      `.-'      `--'      `--'      `--'      `-.'      `--'      `
                  let cubeInnerXPosition: number = -60
                  let cubeInnerZPosition: number = 40 
                  
                  for (let i = 0; i < 2; i++) {

                    //First Straight Line
                    for (let j = 0; j < 50; j++) {
                      let cubepositionX: number = cubeInnerXPosition
                      let cubepositionY: number = cubeHeightPosition
                      let cubepositionZ: number = cubeInnerZPosition

                      const cube: Entity = new Entity()
                      cube.addComponent(new BoxShape())
                      cube.addComponent(
                        new Transform({
                          position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                          rotation: new Quaternion(35,0,220,0),
                          scale: new Vector3(1.25, 1.25, 1.25),
                        })
                      )
                      cube.addComponent(blueCubeMaterial)
                      engine.addEntity(cube)
                      cubes.push(cube)
                      //Change Variables to move along X axis
                      cubeInnerXPosition += 2
                    }

                  // ██████╗░░░███╗░░
                  // ██╔══██╗░████║░░
                  // ██████╦╝██╔██║░░
                  // ██╔══██╗╚═╝██║░░
                  // ██████╦╝███████╗
                  // ╚═════╝░╚══════╝
                    //INNER BEND 1
                    //x2 2x2 Boxes Bend
                    for(let j=0; j<2; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerXPosition += 2
                      }
                      cubeInnerZPosition -= 2
                    }
                    //x2 1x1 Boxes Bend
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerXPosition += 2
                        cubeInnerZPosition -= 2
                      }

                    //x2 2x2 Boxes Bend 1
                    for(let j=0; j<2; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerZPosition -= 2
                      }
                      cubeInnerXPosition += 2
                    }

                    //Long Stretch AFTER BEND 1
                  for (let j = 0; j < 50; j++) {
                    let cubepositionX: number = cubeInnerXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeInnerZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    //Change Variables to move along X axis
                    cubeInnerZPosition -= 2
                  }

                  // ██████╗░██████╗░
                  // ██╔══██╗╚════██╗
                  // ██████╦╝░░███╔═╝
                  // ██╔══██╗██╔══╝░░
                  // ██████╦╝███████╗
                  // ╚═════╝░╚══════╝
                  //INNER BEND 2
                    //x2 2x2 Boxes Bend 2
                    for(let j=0; j<2; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerZPosition -= 2
                      }
                      cubeInnerXPosition -= 2
                    }
                    //x2 1x1 Boxes Bend 2
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerXPosition -= 2
                        cubeInnerZPosition -= 2
                      }

                    //x2 2x2 Boxes Bend 2
                    for(let j=0; j<2; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerXPosition -= 2
                      }
                      cubeInnerZPosition -= 2
                    }

                    //Long Stretch AFTER BEND 2
                  for (let j = 0; j < 50; j++) {
                    let cubepositionX: number = cubeInnerXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeInnerZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    //Change Variables to move along X axis
                    cubeInnerXPosition -= 2
                  }
                  
                  // ██████╗░██████╗░
                  // ██╔══██╗╚════██╗
                  // ██████╦╝░█████╔╝
                  // ██╔══██╗░╚═══██╗
                  // ██████╦╝██████╔╝
                  // ╚═════╝░╚═════╝░
                  //INNER BEND 3
                    //x2 2x2 Boxes Bend
                    for(let j=0; j<2; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerXPosition -= 2
                      }
                      cubeInnerZPosition += 2
                    }
                    //x2 1x1 Boxes Bend
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerXPosition -= 2
                        cubeInnerZPosition += 2
                      }

                    //x2 2x2 Boxes Bend 1
                    for(let j=0; j<2; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerZPosition += 2
                      }
                      cubeInnerXPosition -= 2
                    }

                    //Long Stretch AFTER BEND 3
                  for (let j = 0; j < 50; j++) {
                    let cubepositionX: number = cubeInnerXPosition
                    let cubepositionY: number = cubeHeightPosition
                    let cubepositionZ: number = cubeInnerZPosition

                    const cube: Entity = new Entity()
                    cube.addComponent(new BoxShape())
                    cube.addComponent(
                      new Transform({
                        position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                        rotation: new Quaternion(35,0,220,0),
                        scale: new Vector3(1.25, 1.25, 1.25),
                      })
                    )
                    cube.addComponent(blueCubeMaterial)
                    engine.addEntity(cube)
                    cubes.push(cube)
                    //Change Variables to move along X axis
                    cubeInnerZPosition += 2
                  }
                  
                  // ██████╗░░░██╗██╗
                  // ██╔══██╗░██╔╝██║
                  // ██████╦╝██╔╝░██║
                  // ██╔══██╗███████║
                  // ██████╦╝╚════██║
                  // ╚═════╝░░░░░░╚═╝
                  //INNER BEND 4
                    //x2 2x2 Boxes Bend
                    for(let j=0; j<2; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerZPosition += 2
                      }
                      cubeInnerXPosition += 2
                    }
                    //x2 1x1 Boxes Bend
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerXPosition += 2
                        cubeInnerZPosition += 2
                      }

                    //x2 2x2 Boxes Bend 1
                    for(let j=0; j<2; j++){
                      for(let j=0; j<2; j++){
                        let cubepositionX: number = cubeInnerXPosition
                        let cubepositionY: number = cubeHeightPosition
                        let cubepositionZ: number = cubeInnerZPosition
          
                        const cube: Entity = new Entity()
                        cube.addComponent(new BoxShape())
                        cube.addComponent(
                          new Transform({
                            position: new Vector3(cubepositionX, cubepositionY, cubepositionZ),
                            rotation: new Quaternion(35,0,220,0),
                            scale: new Vector3(1.25, 1.25, 1.25),
                          })
                        )
                        cube.addComponent(blueCubeMaterial)
                        engine.addEntity(cube)
                        cubes.push(cube)
                        cubeInnerXPosition += 2
                      }
                      cubeInnerZPosition += 2
                    }

                    





                    //LAYER 1 COMPLETE
                    //AUTOMATIC MOVEMENT TO LAYER 2
                    //Change in variables to move along the Y Axis
                    cubeInnerXPosition = -60
                    cubeInnerZPosition = 40
                    cubeHeightPosition += 2 // To ensure the colliders aren't intersecting when the simulation starts
                  }
      
                



        // █▀▀ ▄▀█ █▄░█ █▄░█ █▀█ █▄░█   █▄▄ █▀█ ▀▄▀
        // █▄▄ █▀█ █░▀█ █░▀█ █▄█ █░▀█   █▄█ █▄█ █░█ 
        // C̲A̲N̲N̲O̲N̲ B̲O̲D̲I̲E̲S̲
        // Create bodies to represent each of the cubes
        for (let i = 0; i < cubes.length; i++) {
          let cubeTransform: Transform = cubes[i].getComponent(Transform)
          const cubeBody: CANNON.Body = new CANNON.Body({
            mass: 0, // kg
            position: new CANNON.Vec3(cubeTransform.position.x, cubeTransform.position.y, cubeTransform.position.z), // m
            shape: new CANNON.Box(new CANNON.Vec3(1,1,1)) // m
          })

          cubeBody.linearDamping = 0
          cubeBody.angularDamping = 0

          world.addBody(cubeBody) // Add body to the world
          cubeBodies.push(cubeBody)
        }
        
        let joy = 0
        let happiness = 1

        input.subscribe("BUTTON_DOWN", ActionButton.ACTION_6, false, () => {
          joy = 4
          log(joy)
        })

        input.subscribe("BUTTON_DOWN", ActionButton.SECONDARY, false, () => {
          if (happiness == 1){

          }
          if(happiness == 0){
          joy = 5
          log(joy)
          }
        })

        export class magic implements ISystem {
          update(dt: number) {
            if(joy==4){
              for(let i=0; i<cubes.length; i++){
            world.remove(cubeBodies[i]),
            engine.removeEntity(cubes[i])
              }
              joy=0
              happiness=0
            }
    
            if(joy==5){
              for(let i=0; i<cubes.length; i++){
            world.addBody(cubeBodies[i]),
            engine.addEntity(cubes[i])
              }
              joy=0
              happiness=1
            }
            
          }
        }
        
engine.addSystem(new magic())
      



                
      
