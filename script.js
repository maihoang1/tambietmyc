/*!
Sky and Birds Background
Copyright (c) 2024 by Wakana Y.K. (https://codepen.io/wakana-k/pen/XWQpVNB)

bird animation SEE -> https://codepen.io/wakana-k/pen/dyLGQEv
*/
"use strict";

import * as THREE from "three";

import { GPUComputationRenderer as e } from "three/addons/misc/GPUComputationRenderer.js";

!(function () {
  function n() {
    (h = window.innerWidth / 2),
      (y = window.innerHeight / 2),
      (u.aspect = window.innerWidth / window.innerHeight),
      u.updateProjectionMatrix(),
      m.setSize(window.innerWidth, window.innerHeight);
  }
  function t(e) {
    !1 !== e.isPrimary && ((v = e.clientX - h), (p = e.clientY - y));
  }
  const o = {
    color1: "turquoise",
    color2: "#aaaaaa",
    colorMode: "lerpGradient",
    alphaBackground: !0,
    separation: 21,
    alignment: 20,
    cohesion: 20,
    freedom: 0.75,
    speedLimit: 10,
    birdSize: 1,
    wingSpan: 20,
    numRatio: 0.3
  };
  (o.color1 = o.color1 || "red"),
    (o.color2 = o.color2 || "#aaaaaa"),
    (o.colorMode = o.colorMode || "varianceGradient"),
    (o.alphaBackground = o.alphaBackground || !1),
    (o.bgColor = o.bgColor || "white"),
    (o.separation = o.separation || 20),
    (o.alignment = o.alignment || 20),
    (o.cohesion = o.cohesion || 20),
    (o.freedom = o.freedom || 0.75),
    (o.speedLimit = o.speedLimit || 10),
    (o.birdSize = o.birdSize || 1),
    (o.wingSpan = o.wingSpan || 20),
    (o.numRatio = o.numRatio || 1);
  const i = 32,
    a = Math.round(i * i * o.numRatio),
    r =
      "uniform float time;\nuniform float delta;\n\nvoid main() {\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec4 tmpPos = texture2D( texturePosition, uv );\n  vec3 position = tmpPos.xyz;\n  vec3 velocity = texture2D( textureVelocity, uv ).xyz;\n\n  float phase = tmpPos.w;\n\n  phase = mod( ( phase + delta +\n    length( velocity.xz ) * delta * 3. +\n    max( velocity.y, 0.0 ) * delta * 6. ), 62.83 );\n\n  gl_FragColor = vec4( position + velocity * delta * 15. , phase );\n\n}",
    l =
      "uniform float time;\nuniform float testing;\nuniform float delta; // about 0.016\nuniform float separationDistance; // 20\nuniform float alignmentDistance; // 40\nuniform float cohesionDistance;\nuniform float speedLimit;\nuniform float freedomFactor;\nuniform vec3 predator;\n\nconst float width = resolution.x;\nconst float height = resolution.y;\n\nconst float PI = 3.141592653589793;\nconst float PI_2 = PI * 2.0;\n// const float VISION = PI * 0.55;\n\nfloat zoneRadius = 40.0;\nfloat zoneRadiusSquared = 1600.0;\n\nfloat separationThresh = 0.45;\nfloat alignmentThresh = 0.65;\n\nconst float UPPER_BOUNDS = BOUNDS;\nconst float LOWER_BOUNDS = -UPPER_BOUNDS;\n\nfloat rand(vec2 co){\n  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);\n}\n\nvoid main() {\n\n  zoneRadius = separationDistance + alignmentDistance + cohesionDistance;\n  separationThresh = separationDistance / zoneRadius;\n  alignmentThresh = ( separationDistance + alignmentDistance ) / zoneRadius;\n  zoneRadiusSquared = zoneRadius * zoneRadius;\n\n\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  vec3 birdPosition, birdVelocity;\n\n  vec3 selfPosition = texture2D( texturePosition, uv ).xyz;\n  vec3 selfVelocity = texture2D( textureVelocity, uv ).xyz;\n\n  float dist;\n  vec3 dir; // direction\n  float distSquared;\n\n  float separationSquared = separationDistance * separationDistance;\n  float cohesionSquared = cohesionDistance * cohesionDistance;\n\n  float f;\n  float percent;\n\n  vec3 velocity = selfVelocity;\n\n  float limit = speedLimit;\n  \n  dir = predator * UPPER_BOUNDS - selfPosition;\n  dir.z = 0.;\n  // dir.z *= 0.6;\n  dist = length( dir );\n  distSquared = dist * dist;\n\n  float preyRadius = 150.0;\n  float preyRadiusSq = preyRadius * preyRadius;\n\n  // move birds away from predator\n  if (dist < preyRadius) {\n\n    f = ( distSquared / preyRadiusSq - 1.0 ) * delta * 100.;\n    velocity += normalize( dir ) * f;\n    limit += 5.0;\n  }\n\n  // if (testing == 0.0) {}\n  // if ( rand( uv + time ) < freedomFactor ) {}\n\n  // Attract flocks to the center\n  vec3 central = vec3( 0., 0., 0. );\n  dir = selfPosition - central;\n  dist = length( dir );\n\n  dir.y *= 2.5;\n  velocity -= normalize( dir ) * delta * 5.;\n\n  for (float y=0.0;y<height;y++) {\n    for (float x=0.0;x<width;x++) {\n\n      vec2 ref = vec2( x + 0.5, y + 0.5 ) / resolution.xy;\n      birdPosition = texture2D( texturePosition, ref ).xyz;\n\n      dir = birdPosition - selfPosition;\n      dist = length(dir);\n\n      if (dist < 0.0001) continue;\n\n      distSquared = dist * dist;\n\n      if (distSquared > zoneRadiusSquared ) continue;\n\n      percent = distSquared / zoneRadiusSquared;\n\n      if ( percent < separationThresh ) { // low\n\n        // Separation - Move apart for comfort\n        f = (separationThresh / percent - 1.0) * delta;\n        velocity -= normalize(dir) * f;\n\n      } else if ( percent < alignmentThresh ) { // high\n\n        // Alignment - fly the same direction\n        float threshDelta = alignmentThresh - separationThresh;\n        float adjustedPercent = ( percent - separationThresh ) / threshDelta;\n\n        birdVelocity = texture2D( textureVelocity, ref ).xyz;\n\n        f = ( 0.5 - cos( adjustedPercent * PI_2 ) * 0.5 + 0.5 ) * delta;\n        velocity += normalize(birdVelocity) * f;\n\n      } else {\n\n        // Attraction / Cohesion - move closer\n        float threshDelta = 1.0 - alignmentThresh;\n        float adjustedPercent = ( percent - alignmentThresh ) / threshDelta;\n\n        f = ( 0.5 - ( cos( adjustedPercent * PI_2 ) * -0.5 + 0.5 ) ) * delta;\n\n        velocity += normalize(dir) * f;\n\n      }\n    }\n  }\n\n  // this make tends to fly around than down or up\n  // if (velocity.y > 0.) velocity.y *= (1. - 0.2 * delta);\n\n  // Speed Limits\n  if ( length( velocity ) > limit ) {\n    velocity = normalize( velocity ) * limit;\n  }\n\n  gl_FragColor = vec4( velocity, 1.0 );\n\n}",
    s =
      "attribute vec2 reference;\nattribute float birdVertex;\n\nattribute vec3 birdColor;\n\nuniform sampler2D texturePosition;\nuniform sampler2D textureVelocity;\n\nvarying vec4 vColor;\nvarying float z;\n\nuniform float time;\nuniform float birdSize;\n\nvoid main() {\n\n  vec4 tmpPos = texture2D( texturePosition, reference );\n  vec3 pos = tmpPos.xyz;\n  vec3 velocity = normalize(texture2D( textureVelocity, reference ).xyz);\n\n  vec3 newPosition = position;\n\n  if ( birdVertex == 4.0 || birdVertex == 7.0 ) {\n    // flap wings\n    newPosition.y = sin( tmpPos.w ) * 5. * birdSize;\n  }\n\n  newPosition = mat3( modelMatrix ) * newPosition;\n\n  velocity.z *= -1.;\n  float xz = length( velocity.xz );\n  float xyz = 1.;\n  float x = sqrt( 1. - velocity.y * velocity.y );\n\n  float cosry = velocity.x / xz;\n  float sinry = velocity.z / xz;\n\n  float cosrz = x / xyz;\n  float sinrz = velocity.y / xyz;\n\n  mat3 maty =  mat3(\n    cosry, 0, -sinry,\n    0    , 1, 0     ,\n    sinry, 0, cosry\n  );\n\n  mat3 matz =  mat3(\n    cosrz , sinrz, 0,\n    -sinrz, cosrz, 0,\n    0     , 0    , 1\n  );\n  newPosition =  maty * matz * newPosition;\n  newPosition += pos;\n  z = newPosition.z;\n\n  vColor = vec4( birdColor, 1.0 );\n  gl_Position = projectionMatrix *  viewMatrix  * vec4( newPosition, 1.0 );\n}",
    d =
      "varying vec4 vColor;\nvarying float z;\nuniform vec3 color;\nvoid main() {\n/* // 距離に応じて色変更\n  // Fake colors for now\n  float rr = 0.2 + ( 1000. - z ) / 1000. * vColor.x;\n  float gg = 0.2 + ( 1000. - z ) / 1000. * vColor.y;\n  float bb = 0.2 + ( 1000. - z ) / 1000. * vColor.z;\n  gl_FragColor = vec4( rr, gg, bb, 1. );\n  */\n  \n  gl_FragColor = vec4( vColor.rgb, 1. );\n}";
  class c extends THREE.BufferGeometry {
    constructor() {
      function e() {
        for (let e = 0; e < arguments.length; e++) l.array[u++] = arguments[e];
      }
      function n(e) {
        const n = o;
        n.colorMode = n.colorMode || "variance";
        const t = n.color1,
          i = n.color2,
          a = new THREE.Color(t),
          r = new THREE.Color(i);
        let l, s;
        if (
          ((s = -1 != n.colorMode.indexOf("Gradient") ? Math.random() : e),
          0 == n.colorMode.indexOf("variance"))
        ) {
          const e = THREE.MathUtils.clamp(0, a.r + Math.random() * r.r, 1),
            n = THREE.MathUtils.clamp(0, a.g + Math.random() * r.g, 1),
            t = THREE.MathUtils.clamp(0, a.b + Math.random() * r.b, 1);
          l = new THREE.Color(e, n, t);
        } else
          l =
            0 == n.colorMode.indexOf("mix")
              ? new THREE.Color(t + s * i)
              : a.lerp(r, s);
        return l;
      }
      super();
      const t = 3 * a,
        r = 3 * t,
        l = new THREE.BufferAttribute(new Float32Array(3 * r), 3),
        s = new THREE.BufferAttribute(new Float32Array(3 * r), 3),
        d = new THREE.BufferAttribute(new Float32Array(2 * r), 2),
        c = new THREE.BufferAttribute(new Float32Array(r), 1);
      this.setAttribute("position", l),
        this.setAttribute("birdColor", s),
        this.setAttribute("reference", d),
        this.setAttribute("birdVertex", c);
      let u = 0;
      const f = o.wingSpan,
        m = o.birdSize;
      for (let n = 0; n < a; n++)
        e(0, -0, -20 * m, 0, 4 * m, -20 * m, 0, 0, 30 * m),
          e(0, 0, -15 * m, -f * m, 0, 0, 0, 0, 15 * m),
          e(0, 0, 15 * m, f * m, 0, 0, 0, 0, -15 * m);
      const v = {};
      for (let e = 0; e < 3 * t; e++) {
        const t = ~~(~~(e / 3) / 3),
          r = (t % i) / i,
          l = ~~(t / i) / i,
          u = ~~(e / 9) / a,
          f = u.toString(),
          m = -1 != o.colorMode.indexOf("Gradient");
        let p;
        (p = !m && v[f] ? v[f] : n(u)),
          m || v[f] || (v[f] = p),
          (s.array[3 * e + 0] = p.r),
          (s.array[3 * e + 1] = p.g),
          (s.array[3 * e + 2] = p.b),
          (d.array[2 * e] = r),
          (d.array[2 * e + 1] = l),
          (c.array[e] = e % 9);
      }
      this.scale(0.2, 0.2, 0.2);
    }
  }
  let u,
    f,
    m,
    v = 0,
    p = 0,
    h = window.innerWidth / 2,
    y = window.innerHeight / 2;
  const g = 800,
    w = g / 2;
  let x,
    z,
    R,
    E,
    b,
    P,
    T = performance.now();
  ((u = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    1e3
  )).position.z = 350),
    (f = new THREE.Scene()),
    o.alphaBackground || (f.background = new THREE.Color(o.bgColor)),
    (m = new THREE.WebGLRenderer({
      canvas: canvas,
      alpha: o.alphaBackground
    })).setPixelRatio(window.devicePixelRatio),
    m.setSize(window.innerWidth, window.innerHeight),
    (function () {
      (x = new e(i, i, m)),
        !1 === m.capabilities.isWebGL2 && x.setDataType(THREE.HalfFloatType);
      const n = x.createTexture(),
        t = x.createTexture();
      (function (e) {
        const n = e.image.data;
        for (let e = 0, t = n.length; e < t; e += 4) {
          const t = Math.random() * g - w,
            o = Math.random() * g - w,
            i = Math.random() * g - w;
          (n[e + 0] = t), (n[e + 1] = o), (n[e + 2] = i), (n[e + 3] = 1);
        }
      })(n),
        (function (e) {
          const n = e.image.data;
          for (let e = 0, t = n.length; e < t; e += 4) {
            const t = Math.random() - 0.5,
              o = Math.random() - 0.5,
              i = Math.random() - 0.5;
            (n[e + 0] = 10 * t),
              (n[e + 1] = 10 * o),
              (n[e + 2] = 10 * i),
              (n[e + 3] = 1);
          }
        })(t),
        (z = x.addVariable("textureVelocity", l, t)),
        (R = x.addVariable("texturePosition", r, n)),
        x.setVariableDependencies(z, [R, z]),
        x.setVariableDependencies(R, [R, z]),
        (E = R.material.uniforms),
        (b = z.material.uniforms),
        (E.time = {
          value: 0
        }),
        (E.delta = {
          value: 0
        }),
        (b.time = {
          value: 1
        }),
        (b.delta = {
          value: 0
        }),
        (b.testing = {
          value: 1
        }),
        (b.separationDistance = {
          value: 1
        }),
        (b.alignmentDistance = {
          value: 1
        }),
        (b.cohesionDistance = {
          value: 1
        }),
        (b.freedomFactor = {
          value: 1
        }),
        (b.speedLimit = {
          value: o.speedLimit
        }),
        (b.predator = {
          value: new THREE.Vector3()
        }),
        (z.material.defines.BOUNDS = g.toFixed(2)),
        (z.wrapS = THREE.RepeatWrapping),
        (z.wrapT = THREE.RepeatWrapping),
        (R.wrapS = THREE.RepeatWrapping),
        (R.wrapT = THREE.RepeatWrapping),
        x.init();
    })(),
    window.addEventListener("pointermove", t),
    window.addEventListener("pointerdown", t),
    window.addEventListener("resize", n),
    (b.separationDistance.value = o.separation),
    (b.alignmentDistance.value = o.alignment),
    (b.cohesionDistance.value = o.cohesion),
    (function () {
      const e = new c();
      P = {
        birdSize: {
          value: o.birdSize
        },
        texturePosition: {
          value: null
        },
        textureVelocity: {
          value: null
        },
        time: {
          value: 1
        },
        delta: {
          value: 0
        }
      };
      const n = new THREE.ShaderMaterial({
          uniforms: P,
          vertexShader: s,
          fragmentShader: d,
          side: THREE.DoubleSide
        }),
        t = new THREE.Mesh(e, n);
      (t.rotation.y = Math.PI / 2),
        (t.matrixAutoUpdate = !1),
        t.updateMatrix(),
        f.add(t);
    })(),
    (function e() {
      requestAnimationFrame(e),
        (function () {
          const e = performance.now();
          let n = (e - T) / 1e3;
          n > 1 && (n = 1),
            (T = e),
            (E.time.value = e),
            (E.delta.value = n),
            (b.time.value = e),
            (b.delta.value = n),
            (P.time.value = e),
            (P.delta.value = n),
            b.predator.value.set((0.5 * v) / h, (-0.5 * p) / y, 0),
            (v = 1e4),
            (p = 1e4),
            x.compute(),
            (P.texturePosition.value = x.getCurrentRenderTarget(R).texture),
            (P.textureVelocity.value = x.getCurrentRenderTarget(z).texture),
            m.render(f, u);
        })();
    })();
})();
document.addEventListener("DOMContentLoaded", function() {
    // Lưu background hiện tại của trang
    const currentBackground = document.body.style.background;
  
    // Xóa nội dung của các phần tử con của body
    document.body.innerHTML = "";
  
    // Thiết lập lại background cho body
 //   document.body.style.background = currentBackground;
  });
  