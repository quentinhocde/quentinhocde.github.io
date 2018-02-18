'use strict';
import Utils from "./Utils";

let createAnalyser = require('web-audio-analyser'); //hughsk
let average = require('analyser-frequency-average'); //Jam3
const dat = require('dat.gui');

import { frequencyAverages } from './audio-utils'


var utils = new Utils();
var raf = Utils.Raf();
var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );


var resolution = new THREE.Vector2( window.innerWidth, window.innerHeight );

class App {
    constructor() {

        this.scene,
        this.camera,
        this.renderer,
        this.element,
        this.container,
        this.controls;


        this.mouse = {
            x: 0,
            y: 0
        }

        
        document.addEventListener("DOMContentLoaded", () => {
            this.player = document.getElementById('js-audio');
            this.player.crossOrigin = 'Anonymous';

            this.html = document.getElementsByTagName('html')[0];
            this.html.classList.add('dom-is-loaded');
            this.init();

        });
        
        // this.gui();

    }

    init(){


  
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 50000);
        
        this.camera.lookAt(0,30,0);
        this.scene.add(this.camera);

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true});
        // this.renderer.setClearColor(0xffffff, 0);
	    this.renderer.shadowMap.enabled = true;
	    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
        this.element = this.renderer.domElement;
        this.container = document.getElementById('gl');

        this.container.width = this.element.width = window.innerWidth;
        this.container.height = this.element.height = window.innerHeight;

        this.container.appendChild(this.element);

        this.controls = new THREE.OrbitControls(this.camera, this.element);

        this.lights();

        this.prisms = new THREE.Object3D();
        
        this.i = 0;
        this.initBackground();
        this.animate(); 

        this.isLaunched = false;

        window.addEventListener('mousemove',(e) => {
            let x = e.pageX - (window.innerWidth / 2);
            let y = e.pageY - (window.innerHeight / 2);

            x = x * 100 / window.innerWidth;
            y = y * 100 / window.innerHeight;
            
            this.mouse = {
                x: x,
                y: y
            }
        });
       
        document.getElementById('js-launch-button').addEventListener('click',() => {
            this.html.classList.add('experiment-is-launched');
            this.initPrism();
        });
      
    }

    animate(){
        this.i++;

        if(this.background != undefined) {
            // this.background.rotation.set(this.mouse.y * Math.PI / 360, this.mouse.x * Math.PI / 360, 0);

            // if(this.i % 5 === 0){
                TweenMax.to(this.background.rotation,0.2, {
                    x: this.mouse.y * Math.PI / 3000,
                    y: this.mouse.x * Math.PI / 3000
                });
            // }
        }


        this.raf = requestAnimationFrame(()=>this.animate());
        if(this.isLaunched) {
            this.renderExp();
        }

        this.resize();

        this.camera.updateProjectionMatrix();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);

    }

    lights(){

        // this.scene.rotation.y = -Math.PI;

        var ALight = new THREE.AmbientLight( 0x404040, 0.8);
        this.scene.add( ALight );


        this.pLight = new THREE.PointLight( 0xffffff, 1, 1000);
        this.pLight.castShadow = true;

        this.pLight2 = new THREE.PointLight( 0xffffff, 1, 1000);
        this.pLight2.castShadow = true;

        this.pLight3 = new THREE.PointLight( 0xffffff, 1, 1000);
        this.pLight3.castShadow = true;

        this.scene.add(this.pLight);
        this.scene.add(this.pLight2);
        this.scene.add(this.pLight3);

        // var helper = new THREE.CameraHelper( this.pLight.shadow.camera );
        // this.scene.add( helper );

    }

    loaded() {
        this.audio();
        this.initCrazyPrism();
        this.initWiredPrism();
        this.initFlower();
        this.initBubble();

        this.time = Date.now();

        this.mouse = {
            x: 0,
            y: 0
        }

        this.isLaunched = true;

        this.launchScenario();


        document.addEventListener("visibilitychange", () => {
            if (document.hidden) {
              this.player.pause();
            } else  {
              this.player.play();
            }
        }, false);

        document.addEventListener('keydown', (event) => {
            
            if(event.keyCode === 32 && this.int > 18) {
                this.change(parseInt(Math.random() * 7), false);
                this.changeShape();
            }
        });
        
    }

    launchScenario() {
        this.camera.position.set(15000, 0, 15000);
        this.camera.zoom = 0.6;

        TweenMax.to(this.camera,15, {
            zoom: 1,
            delay: 0,
            ease: Power2.easeInOut
        });

        TweenMax.to(this.camera.position,15, {
            x: 500,
            z: 500,
            delay: 0,
            ease: Power2.easeInOut
        });

        this.int = 0;

        TweenLite.delayedCall(13, () => this.change(parseInt(Math.random() * 7),true)); 

    }

  
    initPrism(){

        this.objLoader = new THREE.OBJLoader();

        this.objLoader.load('/obj/ddd.obj', (object) => {

            this.ddd = object;

            this.meshMonolith = this.ddd.children[0];

            // this.monolithGeometry = new THREE.OctahedronGeometry(10,4);
            this.monolithGeometry = new THREE.Geometry().fromBufferGeometry(this.meshMonolith.geometry);
            this.monolithGeometry.translate(0,-30,-10);


            this.prismMaterial = new THREE.MeshPhongMaterial({
                emissive:0x0000ff,
                specular:0x000000,
                transparent: true,
                color:0xff00ff 
            });


            this.prismWrapper = new THREE.Mesh(this.monolithGeometry, this.prismMaterial);

            this.prism = new THREE.Object3D();
            this.prism.name = 'prism';


            let rotationTimeline = new TimelineMax({repeat: -1});
            rotationTimeline.to(this.prism.rotation,100,{
                y: -Math.PI,
                ease: Power0.EaseNone
            });
            rotationTimeline.to(this.prism.rotation,100,{
                y: Math.PI/2,
                ease: Power0.EaseNone
            });
      
            this.prism.add(this.prismWrapper);

            //orgin marker
            this.sphere = new THREE.Mesh(this.sphereGeometry, this.prismMaterial);

            this.prismWrapper.scale.set(6,6,6);

            this.prismWrapper.receiveShadow = true;

            // this.scene.add(this.prism);


            this.timelines = new Array();
            this.offsets = new Array();

            this.offset = 0;

            for (var i = 0; i < this.monolithGeometry.vertices.length; i++) {
                let next = i+1;

                if(i == 0) {
                    next = this.monolithGeometry.vertices.length - 1
                }
                
                let val = {
                    x:this.monolithGeometry.vertices[i].x,
                    y:this.monolithGeometry.vertices[i].y,
                    z:this.monolithGeometry.vertices[i].z
                };

                // console.log(this.monolithGeometry.vertices[next], this.monolithGeometry.vertices[i]);\

                this.offsets.push({
                    x : val.x + parseInt(((Math.random() * 2 - 1) * this.offset)),
                    y : val.y + parseInt(((Math.random() * 2 - 1) * this.offset)),
                    z : val.z + parseInt(((Math.random() * 2 - 1) * this.offset)) 
                });

                // console.log(this.offsets[i].x);

                var self = this;

                function onComplete(idx, val) {

                    self.offsets[idx] = {
                        x : val.x + parseInt(((Math.random() * 2 - 1) * self.offset)),
                        y : val.y + parseInt(((Math.random() * 2 - 1) * self.offset)),
                        z : val.z + parseInt(((Math.random() * 2 - 1) * self.offset)) 
                    };  


                    tl.invalidate("step1");
                    tl.remove("step1");

                    if(idx == 0) {
                        // console.log(step);
                    }

                    let step = new TweenMax.to(self.monolithGeometry.vertices[idx], Math.random() + 0.5,{
                        x: self.offsets[idx].x,
                        y: self.offsets[idx].y,
                        z: self.offsets[idx].z,
                        ease: Power0.easeNone
                    });

                    tl.add(step,0);
                    tl.addLabel('step1',0);


                    tl.restart();
                }


                let tl = new TimelineMax({ delay: i * 0.01, repeatDelay: 0, onComplete: onComplete, onCompleteParams:[i,val] });

                let step1 = new TweenMax.to(this.monolithGeometry.vertices[i], Math.random()+ 0.5,{
                    x: this.offsets[i].x,
                    y: this.offsets[i].y,
                    z: this.offsets[i].z,
                    ease: Power0.easeNone
                });
                tl.add(step1,"step1");

                let step2 = new TweenMax.to(this.monolithGeometry.vertices[i], Math.random()+ 0.5,{
                    x:val.x,
                    y:val.y,
                    z:val.z,
                    ease: Power0.easeNone
                });
                tl.add(step2,"step2");
                
                this.timelines.push(tl);


            }


            this.loaded();


        });

        
    }

    initWiredPrism(){

        this.wiredMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000, 
            transparent: true,
            opacity: 0.05,
            wireframe: true,
            side: THREE.DoubleSide
        });


        this.wiredPrism = new THREE.Mesh(this.monolithGeometry, this.wiredMaterial);


        this.wiredPrism.scale.set(6,6,6);

        let rotationTimeline = new TimelineMax({repeat: -1});
        rotationTimeline.to(this.wiredPrism.rotation,100,{
            y: -Math.PI,
            ease: Power0.EaseNone
        });
        rotationTimeline.to(this.wiredPrism.rotation,100,{
            y: Math.PI,
            ease: Power0.EaseNone
        });

        
    }

    initCrazyPrism(){

        this.crazyGeometry = new THREE.Geometry().fromBufferGeometry(this.meshMonolith.geometry);
        this.crazyGeometry.translate(0,-30,-10);

        this.crazyMaterial = new THREE.MeshPhongMaterial({
            emissive:0x0000ff,
            specular:0x000000,
            color:0xff00ff,
            transparent: true,
            opacity: 0.5
        });


        this.crazyPrismWrapper = new THREE.Mesh(this.crazyGeometry, this.crazyMaterial);

        this.crazyPrism = new THREE.Object3D();
        this.crazyPrism.name = 'crazyPrism';

        this.crazyPrism.add(this.crazyPrismWrapper);
        this.crazyPrismWrapper.scale.set(6,6,6);


        let rotationTimeline = new TimelineMax({repeat: -1});
        rotationTimeline.to(this.crazyPrism.rotation,100,{
            y: -Math.PI,
            ease: Power0.EaseNone
        });
        rotationTimeline.to(this.crazyPrism.rotation,100,{
            y: Math.PI,
            ease: Power0.EaseNone
        });


        for (var i = this.crazyGeometry.vertices.length - 1; i >= 0; i--) {
            let next = i+1;
            if(i == this.crazyGeometry.vertices.length - 1) {
                next = 0
            }
            
            let val = {
                x:this.crazyGeometry.vertices[i].x,
                y:this.crazyGeometry.vertices[i].y,
                z:this.crazyGeometry.vertices[i].z
            };

            let tl = new TimelineMax({repeat: -1, delay: i * 0.05, repeatDelay: 0 });
            tl.to(this.crazyGeometry.vertices[i], 1,{
                x: this.crazyGeometry.vertices[next].x,
                y: this.crazyGeometry.vertices[next].y ,
                z: this.crazyGeometry.vertices[next].z,
                ease: Power2.EaseInOut
            });
            tl.to(this.crazyGeometry.vertices[i], 1,{
                x:val.x,
                y:val.y,
                z:val.z,
                ease: Power2.EaseInOut
            });

            // tl.pause();


        }

    }

    initBubble() {
        this.bubbleVertices = new Array();
        this.bubbleGeometry = new THREE.SphereGeometry(350,12,12,0,Math.PI*2,0,Math.PI);

        this.bubbleVertices = this.bubbleGeometry.vertices;

        this.bubbleWMaterial = new THREE.MeshPhongMaterial({
            color: 0xeeeeee, 
            transparent: true,
            opacity: 0.5,
            wireframe: true,
        });

        this.bubbleMaterial = new THREE.MeshPhongMaterial({
            emissive:0x0000ff,
            specular:0x000000,
            transparent: true,
            color:0xff00ff,
            opacity: 0.5,
            side: THREE.DoubleSide
        });


        // this.bubbleWired = new THREE.Mesh(this.bubbleGeometry, this.bubbleWMaterial);
        this.bubbleWrapper = new THREE.Mesh(this.bubbleGeometry, this.bubbleMaterial);
        this.bubbleWrapper.receiveShadow = true;

        this.bubble = new THREE.Object3D();

        this.rotationBubbleTimeline = new TimelineMax({repeat: -1});
        this.rotationBubbleTimeline.to(this.bubble.rotation,100,{
            y: Math.PI * 2,
            ease: Power0.EaseNone
        });
        // this.rotationBubbleTimeline.pause();

        this.scaleBubbleTimeline = new TimelineMax({repeat: -1});
        this.scaleBubbleTimeline.to(this.bubble.scale,0.33,{
            x: 1.4,
            y: 1.4,
            z: 1.4,
            ease: Power0.EaseNone
        });
        this.scaleBubbleTimeline.to(this.bubble.scale,0.33,{
            x: 1.2,
            y: 1.2,
            z: 1.2,
            ease: Power0.EaseNone
        });
        this.scaleBubbleTimeline.to(this.bubble.scale,0.33,{
            x: 1.4,
            y: 1.4,
            z: 1.4,
            ease: Power0.EaseNone
        });
        this.scaleBubbleTimeline.pause();

        // this.bubble.add(this.bubbleWired);
        this.bubble.add(this.bubbleWrapper);
        // this.scene.add(this.bubble);

        // this.bubble.position.set(-300,0,-300);


        for (var i = this.bubbleVertices.length - 1; i >= 0; i--) {
            let val = {
                x:this.bubbleVertices[i].x,
                y:this.bubbleVertices[i].y,
                z:this.bubbleVertices[i].z,
            };


            let tl = new TimelineMax({repeat: -1, delay: 0.01 * i});
            tl.to(this.bubbleVertices[i], Math.random() + 1.2 ,{
                y: val.y + 50,
                z: val.z + 50,
                ease: Power2.easeInOut
            });
            tl.to(this.bubbleVertices[i], Math.random() + 1.2 ,{
                y:val.y,
                z:val.z,
                ease: Power2.easeInOut
            });


        }
    }

    initFlower() {
        this.flowerVertices = new Array();
        this.flowerGeometry = new THREE.SphereGeometry(50,22,22);
        this.flowerBaseGeometry = new THREE.SphereGeometry(50,22,22);
        // this.flowerGeometry = new THREE.TorusGeometry( 300, 8, 20, 24);
        this.flowerGeometry.translate(0,30,10);

        this.flowerVertices = this.flowerGeometry.vertices;

        this.flowerWMaterial = new THREE.MeshPhongMaterial({
            emissive:0x0000ff,
            specular:0x000000,
            transparent: true,
            color:0xff00ff,
            wireframe: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });

        this.flowerMaterial = new THREE.MeshPhongMaterial({
            emissive:0x0000ff,
            specular:0x000000,
            transparent: true,
            color:0xff00ff,
            opacity: 0.4,
            side: THREE.FrontSide
        });


        this.flowerWired = new THREE.Mesh(this.flowerGeometry, this.flowerWMaterial);
        this.flowerWrapper = new THREE.Mesh(this.flowerGeometry, this.flowerMaterial);
        this.flowerWired.receiveShadow = true;

        // this.flowerWrapper.position.set(0, 30, 10);


        this.flower = new THREE.Object3D();

        let rotationTimeline = new TimelineMax({repeat: -1});
        rotationTimeline.to(this.flower.rotation,100,{
            y: -Math.PI,
            ease: Power0.EaseNone
        });
        rotationTimeline.to(this.flower.rotation,100,{
            y: Math.PI,
            ease: Power0.EaseNone
        });
        

        this.flower.add(this.flowerWrapper);
        // this.flower.add(this.flowerWired);
        this.scene.add(this.flower);

        // this.flower.position.set(-300,0,-300);

        for (var i = 0; i < this.flowerVertices.length; i++) {

            let tl = new TimelineMax({ delay: 10 + Math.random() * 15, repeatDelay: 0})

            if(i < this.prismWrapper.geometry.vertices.length) {
                tl.to(this.flowerVertices[i], 10 ,{
                    x: this.prismWrapper.geometry.vertices[i].x * 6,
                    y: this.prismWrapper.geometry.vertices[i].y * 6,
                    z: this.prismWrapper.geometry.vertices[i].z * 6,
                    ease: Power3.easeInOut
                });
            }else {
                tl.to(this.flowerVertices[i], 10 ,{
                    x: this.prismWrapper.geometry.vertices[this.prismWrapper.geometry.vertices.length - 1].x * 6,
                    y: this.prismWrapper.geometry.vertices[this.prismWrapper.geometry.vertices.length - 1].y * 6,
                    z: this.prismWrapper.geometry.vertices[this.prismWrapper.geometry.vertices.length - 1].z * 6,
                    ease: Power3.easeInOut
                });
            }

        }
    }

    reinitFlower() {
        for (var i = 0; i < this.flowerVertices.length; i++) {

            let tl = new TimelineMax({ delay: Math.random() * 10, repeatDelay: 0})

                tl.to(this.flowerVertices[i], 5 ,{
                    x: this.flowerBaseGeometry.vertices[i].x,
                    y: this.flowerBaseGeometry.vertices[i].y,
                    z: this.flowerBaseGeometry.vertices[i].z,
                    ease: Power3.easeInOut
                });

        }
    }

    initBackground() {

        this.background = new THREE.Object3D();
        // this.background.rotation.set(0,Math.PI / 4,0);

        this.backgroundScaleTimelines = new Array();
        this.backgroundUnScaleTimelines = new Array();


        let y = 1620;
        let x = -2125;
        let offset = 250;

        this.boxGeometry = new THREE.BoxGeometry(20,20,20);

        this.backgroundMaterial = new THREE.MeshLambertMaterial({
            color: 0x000000, 
            opacity: 0.1,
            transparent: true,
            wireframe: true
        });


        for (var i = 300 - 1; i >= 0; i--) {

            let cube = new THREE.Mesh(this.boxGeometry, this.backgroundMaterial);

            cube.position.set(x,y,-1300);
            cube.scale.set(0.001,0.001,0.001);

            let scaleTl = new TimelineMax();
            scaleTl.to(cube.scale, Math.random() + 0.3 ,{
                x: 1,
                y: 1,
                z: 1,
                ease: Power2.easeInOut
            });
            // scaleTl.pause();


            let rotationTl = new TimelineMax({repeat:-1});
            rotationTl.to(cube.rotation, Math.random() + 2 ,{
                x: Math.PI,
                y: 0,
                z: 0,
                ease: Power0.EaseNone

            });
            rotationTl.to(cube.rotation, Math.random() + 2 ,{
                x: 0,
                y: Math.PI,
                z: 0,
                ease: Power0.EaseNone

            });
            rotationTl.to(cube.rotation, Math.random() + 2 ,{
                x: 0,
                y: 0,
                z: Math.PI,
                ease: Power0.EaseNone

            });
            rotationTl.to(cube.rotation, Math.random() + 2 ,{
                x: 0,
                y: 0,
                z: 0,
                ease: Power0.EaseNone

            });


            this.background.add(cube);

            this.backgroundScaleTimelines.push(scaleTl);

             x+= offset;

            if(i % 20 == 0) {
                y-= offset;
                x= -2125;
            }
        }

        this.camera.add(this.background);

    }


    audio() {
        

        // Set up our AnalyserNode utility
        this.analyser = createAnalyser(this.player, {
            stereo: false
        });

        this.player.play();

        this.analyserNode = this.analyser.analyser;
        let sampleRate = this.analyser.ctx.sampleRate;
        let fftSize = this.analyserNode.fftSize;

        this.getAverage = frequencyAverages(sampleRate, fftSize);

        this.isPlaying = true;
    }
    
    resize(){
        let width = this.container.offsetWidth;
        let height = this.container.offsetHeight;

        this.camera.aspect = width / height;
        this.renderer.setSize(width, height);
    }
    
    renderExp(){

        let now = Date.now() * 0.001;

        this.crazyGeometry.verticesNeedUpdate = true;
        this.crazyGeometry.facesNeedUpdate = true;
        this.monolithGeometry.verticesNeedUpdate = true;
        this.monolithGeometry.facesNeedUpdate = true;
        this.bubbleGeometry.verticesNeedUpdate = true;
        this.bubbleGeometry.facesNeedUpdate = true;
        this.flowerGeometry.verticesNeedUpdate = true;
        this.flowerGeometry.facesNeedUpdate = true;


        this.pLight.position.x = Math.sin( now * 0.7 ) * 600;
        this.pLight.position.y = Math.cos( now * 0.5 ) * 600;
        this.pLight.position.z = Math.cos( now * 0.1 ) * 600;

        this.pLight2.position.x = Math.sin( now * 0.1 ) * 600;
        this.pLight2.position.y = Math.cos( now * 0.2 ) * 600;
        this.pLight2.position.z = Math.cos( now * 0.3 ) * 600;

        this.pLight3.position.x = Math.sin( now * 0.8 ) * 600;
        this.pLight3.position.y = Math.cos( now * 0.9 ) * 600;
        this.pLight3.position.z = Math.cos( now * 0.6 ) * 600;

        try{
            // grab our byte frequency data for this frame
            this.freqs = this.analyser.waveform();

            // Get different range of frequencies
            this.bass = this.getAverage(this.freqs, 0, 100);
            this.midBass = this.getAverage(this.freqs, 200, 600);
            this.voice = this.getAverage(this.freqs, 600, 2000 );
            this.drum = this.getAverage(this.freqs, 6000, 10000 );
            this.trebble = this.getAverage(this.freqs, 20500, 21000 );

        }
        catch(e){
            // console.warn(e);
        }

        this.resize();


        this.camera.updateProjectionMatrix();
        this.controls.update();
        this.renderer.render(this.scene, this.camera);

    }

    change(id, isAuto) {
        if(isAuto) {
            TweenLite.delayedCall(0.99, () => this.change(parseInt(Math.random() * 7),true)); 
        }

        if(this.int === 83) {
            location.reload();
        }

        let color = new THREE.Color(`rgba(${parseInt(Math.random()*255)},${parseInt(Math.random()*255)},${parseInt(Math.random()*255)})`);
        this.prismWrapper.material.color = color;
        this.flowerWrapper.material.color = color;
        this.crazyPrismWrapper.material.color = color;
        this.bubbleWrapper.material.color = color;

        this.drop = (this.int >= 43 && this.int <= 66);

        if(isAuto){

            //prepare drop for css
            if(this.int === 42) {
                this.html.classList.add('drop');
            }
            if(this.int === 66) {
                this.html.classList.remove('drop');
                this.backgroundMaterial.color = new THREE.Color(0x000000);
                this.backgroundMaterial.opacity = 0.1;
            }

            //prepare/unprepare drop for background
            if(this.int === 43) {
                this.backgroundMaterial.color = new THREE.Color(0xffffff);
                this.backgroundMaterial.opacity = 0.8;
            }

            if(this.int % 4 === 0 && this.int < 43) {
                this.offset = 1;

            }

            if(this.int % 2 == 0) {
                // TweenMax.to(this.camera,1,{
                //     zoom: parseInt(Math.random() * 0.5 ) + 0.5,
                //     ease: Power0.easeNone
                // });
                let rand1 = Math.random() * 600 + 300;
                let rand2 = Math.random() * 600 + 300;
                let rand3 = Math.random() * 600 + 300;

                let tl = new TimelineMax();
                // tl.to(this.camera.position,0, {
                //     x: rand1,
                //     y: rand2,
                //     z: rand3
                // });
                tl.to(this.camera.position,2, {
                    x: rand3,
                    y: rand1,
                    z: rand2,
                    ease: Ease.power2EaseInOut
                });
                // tl.to(this.camera.position,0, {
                //     x: 750,
                //     y: 0,
                //     z: 750
                // });
            }


            if(this.drop) {
                this.offset = parseInt(Math.random() * 20 + 10);
                id = 1;

                this.scaleBubbleTimeline.play();

                for (var i = this.backgroundScaleTimelines.length - 1; i >= 0; i--) {
                    this.backgroundScaleTimelines[i].reverse(!this.backgroundScaleTimelines[i].reverse);
                }

            } else {
                if(this.int % 2 == 0) {
                    for (var i = this.backgroundScaleTimelines.length - 1; i >= 0; i--) {
                        this.backgroundScaleTimelines[i].reverse(!this.backgroundScaleTimelines[i].reverse);
                    }
                }
            }


            if(this.int === 18) {
                this.scene.remove(this.flower);
                id = 0;
                this.html.classList.add('is-controllable');
            }

            if(this.int === 24) {
                this.html.classList.remove('is-controllable');
            }


            if(this.int === 67) {
                this.scene.add(this.flower);
                this.reinitFlower();

                this.scene.remove(this.prism);
                this.scene.remove(this.crazyPrism);
                this.scene.remove(this.wiredPrism);

            }

            this.int++;

            if(this.int >= 64) {
                this.offset = 1;
                return false;
            }


            if(this.int < 18) return false;

            if(this.int % 8 === 0 && this.int != 0) {

                if(this.camera.position.z == 750) {
                    TweenMax.to(this.camera.position,4,{
                        x : parseInt(Math.random() * 500) + 150,
                        y : parseInt(Math.random() * 500) + 150,
                        z : parseInt(Math.random() * 500) + 150,
                        ease: Power0.easeNone
                    });

                    // this.camera.position.set(parseInt(Math.random() * 1000) + 500, parseInt(Math.random() * 1000) + 500, parseInt(Math.random() * 1000) + 500);
                } else {
                    TweenMax.to(this.camera.position,4,{
                        x : 500,
                        y : 0,
                        z : 500
                    });
                    // this.camera.position.set(750, 0, 750);
                }
            }

            switch(id) {

                case 0 :

                    this.scene.add(this.wiredPrism);

                    this.scene.add(this.crazyPrism);
                    this.scene.remove(this.prism);


                    break;

                case 1 :

                    this.scene.add(this.wiredPrism);

                    this.scene.add(this.prism);
                    this.scene.remove(this.crazyPrism);

                    break;

                case 2 :

                    this.scene.add(this.wiredPrism);

                    break;

                case 3 :
                    this.scene.remove(this.wiredPrism);

                    break;

                case 4 :

                    this.scene.add(this.crazyPrism);
                    this.scene.remove(this.prism);

                    break;

                case 5 :

                    this.scene.add(this.prism);
                    this.scene.remove(this.crazyPrism);

                    if(!this.drop){
                        for (var i = this.backgroundScaleTimelines.length - 1; i >= 0; i--) {
                            this.backgroundScaleTimelines[i].reverse();
                        }
                    }

                case 6 :

                    if(!this.drop){
                        this.offset = parseInt(Math.random() * 10);
                    }
                    break;

                default :

            }

        }
    }

    changeShape() {
        if(this.scene.getObjectByName('prism')) {
            this.scene.add(this.crazyPrism);
            this.scene.remove(this.prism);
        } else {
            this.scene.add(this.prism);
            this.scene.remove(this.crazyPrism);
        }
    }

    gui() {

        var DebugPanel = function() {
            this.opacityCrazyPrism = 1;
            this.opacityWiredPrism = 1;
            this.opacityPrism = 1;
            this.opacityBubble = 0.5;
            this.flowerScale = 1;
        };

        let obj = new DebugPanel();

        const gui = new dat.GUI();


        let opacityCrazyController = gui.add(obj, 'opacityCrazyPrism',0,1).step(0.1);
        let opacityWiredPrismController = gui.add(obj, 'opacityWiredPrism',0,1).step(0.1);
        let opacityPrismController = gui.add(obj, 'opacityPrism',0,1).step(0.1);
        let opacityBubbleController = gui.add(obj, 'opacityBubble',0,1).step(0.1);
        let flowerScaleController = gui.add(obj, 'flowerScale',0,5).step(0.1);
        

        opacityCrazyController.onChange((value) => {
            this.crazyPrismWrapper.material.opacity = value; 
        });

        opacityWiredPrismController.onChange((value) => {
            this.wiredPrism.material.opacity = value; 
        });

        opacityPrismController.onChange((value) => {
            this.prismWrapper.material.opacity = value; 
        });

        opacityBubbleController.onChange((value) => {
            this.bubbleWrapper.material.opacity = value; 
        });

        flowerScaleController.onChange((value) => {
            this.flowerGeometry.scale(value,value,value);
        });
        

    }

}



var app = new App();

