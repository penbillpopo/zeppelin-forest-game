import { D as DOMAdapter, u as uid, a as EventEmitter, l as Bounds, w as warn, E as ExtensionType } from "./index-af46228a.js";
const idCounts = /* @__PURE__ */ Object.create(null);
const idHash = /* @__PURE__ */ Object.create(null);
function createIdFromString(value, groupId) {
  let id = idHash[value];
  if (id === void 0) {
    if (idCounts[groupId] === void 0) {
      idCounts[groupId] = 1;
    }
    idHash[value] = id = idCounts[groupId]++;
  }
  return id;
}
let context;
function getTestContext() {
  if (!context || (context == null ? void 0 : context.isContextLost())) {
    const canvas = DOMAdapter.get().createCanvas();
    context = canvas.getContext("webgl", {});
  }
  return context;
}
let maxFragmentPrecision;
function getMaxFragmentPrecision() {
  if (!maxFragmentPrecision) {
    maxFragmentPrecision = "mediump";
    const gl = getTestContext();
    if (gl) {
      if (gl.getShaderPrecisionFormat) {
        const shaderFragment = gl.getShaderPrecisionFormat(gl.FRAGMENT_SHADER, gl.HIGH_FLOAT);
        maxFragmentPrecision = shaderFragment.precision ? "highp" : "mediump";
      }
    }
  }
  return maxFragmentPrecision;
}
function addProgramDefines(src, isES300, isFragment) {
  if (isES300)
    return src;
  if (isFragment) {
    src = src.replace("out vec4 finalColor;", "");
    return `
        
        #ifdef GL_ES // This checks if it is WebGL1
        #define in varying
        #define finalColor gl_FragColor
        #define texture texture2D
        #endif
        ${src}
        `;
  }
  return `
        
        #ifdef GL_ES // This checks if it is WebGL1
        #define in attribute
        #define out varying
        #endif
        ${src}
        `;
}
function ensurePrecision(src, options, isFragment) {
  const maxSupportedPrecision = isFragment ? options.maxSupportedFragmentPrecision : options.maxSupportedVertexPrecision;
  if (src.substring(0, 9) !== "precision") {
    let precision = isFragment ? options.requestedFragmentPrecision : options.requestedVertexPrecision;
    if (precision === "highp" && maxSupportedPrecision !== "highp") {
      precision = "mediump";
    }
    return `precision ${precision} float;
${src}`;
  } else if (maxSupportedPrecision !== "highp" && src.substring(0, 15) === "precision highp") {
    return src.replace("precision highp", "precision mediump");
  }
  return src;
}
function insertVersion(src, isES300) {
  if (!isES300)
    return src;
  return `#version 300 es
${src}`;
}
const fragmentNameCache = {};
const VertexNameCache = {};
function setProgramName(src, { name = `pixi-program` }, isFragment = true) {
  name = name.replace(/\s+/g, "-");
  name += isFragment ? "-fragment" : "-vertex";
  const nameCache = isFragment ? fragmentNameCache : VertexNameCache;
  if (nameCache[name]) {
    nameCache[name]++;
    name += `-${nameCache[name]}`;
  } else {
    nameCache[name] = 1;
  }
  if (src.indexOf("#define SHADER_NAME") !== -1)
    return src;
  const shaderName = `#define SHADER_NAME ${name}`;
  return `${shaderName}
${src}`;
}
function stripVersion(src, isES300) {
  if (!isES300)
    return src;
  return src.replace("#version 300 es", "");
}
const processes = {
  // strips any version headers..
  stripVersion,
  // adds precision string if not already present
  ensurePrecision,
  // add some defines if WebGL1 to make it more compatible with WebGL2 shaders
  addProgramDefines,
  // add the program name to the shader
  setProgramName,
  // add the version string to the shader header
  insertVersion
};
const programCache$1 = /* @__PURE__ */ Object.create(null);
const _GlProgram = class _GlProgram2 {
  /**
   * Creates a shiny new GlProgram. Used by WebGL renderer.
   * @param options - The options for the program.
   */
  constructor(options) {
    options = { ..._GlProgram2.defaultOptions, ...options };
    const isES300 = options.fragment.indexOf("#version 300 es") !== -1;
    const preprocessorOptions = {
      stripVersion: isES300,
      ensurePrecision: {
        requestedFragmentPrecision: options.preferredFragmentPrecision,
        requestedVertexPrecision: options.preferredVertexPrecision,
        maxSupportedVertexPrecision: "highp",
        maxSupportedFragmentPrecision: getMaxFragmentPrecision()
      },
      setProgramName: {
        name: options.name
      },
      addProgramDefines: isES300,
      insertVersion: isES300
    };
    let fragment = options.fragment;
    let vertex = options.vertex;
    Object.keys(processes).forEach((processKey) => {
      const processOptions = preprocessorOptions[processKey];
      fragment = processes[processKey](fragment, processOptions, true);
      vertex = processes[processKey](vertex, processOptions, false);
    });
    this.fragment = fragment;
    this.vertex = vertex;
    this.transformFeedbackVaryings = options.transformFeedbackVaryings;
    this._key = createIdFromString(`${this.vertex}:${this.fragment}`, "gl-program");
  }
  /** destroys the program */
  destroy() {
    this.fragment = null;
    this.vertex = null;
    this._attributeData = null;
    this._uniformData = null;
    this._uniformBlockData = null;
    this.transformFeedbackVaryings = null;
  }
  /**
   * Helper function that creates a program for a given source.
   * It will check the program cache if the program has already been created.
   * If it has that one will be returned, if not a new one will be created and cached.
   * @param options - The options for the program.
   * @returns A program using the same source
   */
  static from(options) {
    const key = `${options.vertex}:${options.fragment}`;
    if (!programCache$1[key]) {
      programCache$1[key] = new _GlProgram2(options);
    }
    return programCache$1[key];
  }
};
_GlProgram.defaultOptions = {
  preferredVertexPrecision: "highp",
  preferredFragmentPrecision: "mediump"
};
let GlProgram = _GlProgram;
const attributeFormatData = {
  uint8x2: { size: 2, stride: 2, normalised: false },
  uint8x4: { size: 4, stride: 4, normalised: false },
  sint8x2: { size: 2, stride: 2, normalised: false },
  sint8x4: { size: 4, stride: 4, normalised: false },
  unorm8x2: { size: 2, stride: 2, normalised: true },
  unorm8x4: { size: 4, stride: 4, normalised: true },
  snorm8x2: { size: 2, stride: 2, normalised: true },
  snorm8x4: { size: 4, stride: 4, normalised: true },
  uint16x2: { size: 2, stride: 4, normalised: false },
  uint16x4: { size: 4, stride: 8, normalised: false },
  sint16x2: { size: 2, stride: 4, normalised: false },
  sint16x4: { size: 4, stride: 8, normalised: false },
  unorm16x2: { size: 2, stride: 4, normalised: true },
  unorm16x4: { size: 4, stride: 8, normalised: true },
  snorm16x2: { size: 2, stride: 4, normalised: true },
  snorm16x4: { size: 4, stride: 8, normalised: true },
  float16x2: { size: 2, stride: 4, normalised: false },
  float16x4: { size: 4, stride: 8, normalised: false },
  float32: { size: 1, stride: 4, normalised: false },
  float32x2: { size: 2, stride: 8, normalised: false },
  float32x3: { size: 3, stride: 12, normalised: false },
  float32x4: { size: 4, stride: 16, normalised: false },
  uint32: { size: 1, stride: 4, normalised: false },
  uint32x2: { size: 2, stride: 8, normalised: false },
  uint32x3: { size: 3, stride: 12, normalised: false },
  uint32x4: { size: 4, stride: 16, normalised: false },
  sint32: { size: 1, stride: 4, normalised: false },
  sint32x2: { size: 2, stride: 8, normalised: false },
  sint32x3: { size: 3, stride: 12, normalised: false },
  sint32x4: { size: 4, stride: 16, normalised: false }
};
function getAttributeInfoFromFormat(format) {
  return attributeFormatData[format] ?? attributeFormatData.float32;
}
const WGSL_TO_VERTEX_TYPES = {
  f32: "float32",
  "vec2<f32>": "float32x2",
  "vec3<f32>": "float32x3",
  "vec4<f32>": "float32x4",
  vec2f: "float32x2",
  vec3f: "float32x3",
  vec4f: "float32x4",
  i32: "sint32",
  "vec2<i32>": "sint32x2",
  "vec3<i32>": "sint32x3",
  "vec4<i32>": "sint32x4",
  u32: "uint32",
  "vec2<u32>": "uint32x2",
  "vec3<u32>": "uint32x3",
  "vec4<u32>": "uint32x4",
  bool: "uint32",
  "vec2<bool>": "uint32x2",
  "vec3<bool>": "uint32x3",
  "vec4<bool>": "uint32x4"
};
function extractAttributesFromGpuProgram({ source, entryPoint }) {
  const results = {};
  const mainVertStart = source.indexOf(`fn ${entryPoint}`);
  if (mainVertStart !== -1) {
    const arrowFunctionStart = source.indexOf("->", mainVertStart);
    if (arrowFunctionStart !== -1) {
      const functionArgsSubstring = source.substring(mainVertStart, arrowFunctionStart);
      const inputsRegex = /@location\((\d+)\)\s+([a-zA-Z0-9_]+)\s*:\s*([a-zA-Z0-9_<>]+)(?:,|\s|$)/g;
      let match;
      while ((match = inputsRegex.exec(functionArgsSubstring)) !== null) {
        const format = WGSL_TO_VERTEX_TYPES[match[3]] ?? "float32";
        results[match[2]] = {
          location: parseInt(match[1], 10),
          format,
          stride: getAttributeInfoFromFormat(format).stride,
          offset: 0,
          instance: false,
          start: 0
        };
      }
    }
  }
  return results;
}
function extractStructAndGroups(wgsl) {
  var _a, _b;
  const linePattern = /(^|[^/])@(group|binding)\(\d+\)[^;]+;/g;
  const groupPattern = /@group\((\d+)\)/;
  const bindingPattern = /@binding\((\d+)\)/;
  const namePattern = /var(<[^>]+>)? (\w+)/;
  const typePattern = /:\s*(\w+)/;
  const structPattern = /struct\s+(\w+)\s*{([^}]+)}/g;
  const structMemberPattern = /(\w+)\s*:\s*([\w\<\>]+)/g;
  const structName = /struct\s+(\w+)/;
  const groups = (_a = wgsl.match(linePattern)) == null ? void 0 : _a.map((item) => ({
    group: parseInt(item.match(groupPattern)[1], 10),
    binding: parseInt(item.match(bindingPattern)[1], 10),
    name: item.match(namePattern)[2],
    isUniform: item.match(namePattern)[1] === "<uniform>",
    type: item.match(typePattern)[1]
  }));
  if (!groups) {
    return {
      groups: [],
      structs: []
    };
  }
  const structs = ((_b = wgsl.match(structPattern)) == null ? void 0 : _b.map((struct) => {
    const name = struct.match(structName)[1];
    const members = struct.match(structMemberPattern).reduce((acc, member) => {
      const [name2, type] = member.split(":");
      acc[name2.trim()] = type.trim();
      return acc;
    }, {});
    if (!members) {
      return null;
    }
    return { name, members };
  }).filter(({ name }) => groups.some((group) => group.type === name))) ?? [];
  return {
    groups,
    structs
  };
}
var ShaderStage = /* @__PURE__ */ ((ShaderStage2) => {
  ShaderStage2[ShaderStage2["VERTEX"] = 1] = "VERTEX";
  ShaderStage2[ShaderStage2["FRAGMENT"] = 2] = "FRAGMENT";
  ShaderStage2[ShaderStage2["COMPUTE"] = 4] = "COMPUTE";
  return ShaderStage2;
})(ShaderStage || {});
function generateGpuLayoutGroups({ groups }) {
  const layout = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!layout[group.group]) {
      layout[group.group] = [];
    }
    if (group.isUniform) {
      layout[group.group].push({
        binding: group.binding,
        visibility: ShaderStage.VERTEX | ShaderStage.FRAGMENT,
        buffer: {
          type: "uniform"
        }
      });
    } else if (group.type === "sampler") {
      layout[group.group].push({
        binding: group.binding,
        visibility: ShaderStage.FRAGMENT,
        sampler: {
          type: "filtering"
        }
      });
    } else if (group.type === "texture_2d") {
      layout[group.group].push({
        binding: group.binding,
        visibility: ShaderStage.FRAGMENT,
        texture: {
          sampleType: "float",
          viewDimension: "2d",
          multisampled: false
        }
      });
    }
  }
  return layout;
}
function generateLayoutHash({ groups }) {
  const layout = [];
  for (let i = 0; i < groups.length; i++) {
    const group = groups[i];
    if (!layout[group.group]) {
      layout[group.group] = {};
    }
    layout[group.group][group.name] = group.binding;
  }
  return layout;
}
function removeStructAndGroupDuplicates(vertexStructsAndGroups, fragmentStructsAndGroups) {
  const structNameSet = /* @__PURE__ */ new Set();
  const dupeGroupKeySet = /* @__PURE__ */ new Set();
  const structs = [...vertexStructsAndGroups.structs, ...fragmentStructsAndGroups.structs].filter((struct) => {
    if (structNameSet.has(struct.name)) {
      return false;
    }
    structNameSet.add(struct.name);
    return true;
  });
  const groups = [...vertexStructsAndGroups.groups, ...fragmentStructsAndGroups.groups].filter((group) => {
    const key = `${group.name}-${group.binding}`;
    if (dupeGroupKeySet.has(key)) {
      return false;
    }
    dupeGroupKeySet.add(key);
    return true;
  });
  return { structs, groups };
}
const programCache = /* @__PURE__ */ Object.create(null);
class GpuProgram {
  /**
   * Create a new GpuProgram
   * @param options - The options for the gpu program
   */
  constructor(options) {
    var _a, _b;
    this._layoutKey = 0;
    this._attributeLocationsKey = 0;
    const { fragment, vertex, layout, gpuLayout, name } = options;
    this.name = name;
    this.fragment = fragment;
    this.vertex = vertex;
    if (fragment.source === vertex.source) {
      const structsAndGroups = extractStructAndGroups(fragment.source);
      this.structsAndGroups = structsAndGroups;
    } else {
      const vertexStructsAndGroups = extractStructAndGroups(vertex.source);
      const fragmentStructsAndGroups = extractStructAndGroups(fragment.source);
      this.structsAndGroups = removeStructAndGroupDuplicates(vertexStructsAndGroups, fragmentStructsAndGroups);
    }
    this.layout = layout ?? generateLayoutHash(this.structsAndGroups);
    this.gpuLayout = gpuLayout ?? generateGpuLayoutGroups(this.structsAndGroups);
    this.autoAssignGlobalUniforms = !!(((_a = this.layout[0]) == null ? void 0 : _a.globalUniforms) !== void 0);
    this.autoAssignLocalUniforms = !!(((_b = this.layout[1]) == null ? void 0 : _b.localUniforms) !== void 0);
    this._generateProgramKey();
  }
  // TODO maker this pure
  _generateProgramKey() {
    const { vertex, fragment } = this;
    const bigKey = vertex.source + fragment.source + vertex.entryPoint + fragment.entryPoint;
    this._layoutKey = createIdFromString(bigKey, "program");
  }
  get attributeData() {
    this._attributeData ?? (this._attributeData = extractAttributesFromGpuProgram(this.vertex));
    return this._attributeData;
  }
  /** destroys the program */
  destroy() {
    this.gpuLayout = null;
    this.layout = null;
    this.structsAndGroups = null;
    this.fragment = null;
    this.vertex = null;
  }
  /**
   * Helper function that creates a program for a given source.
   * It will check the program cache if the program has already been created.
   * If it has that one will be returned, if not a new one will be created and cached.
   * @param options - The options for the program.
   * @returns A program using the same source
   */
  static from(options) {
    const key = `${options.vertex.source}:${options.fragment.source}:${options.fragment.entryPoint}:${options.vertex.entryPoint}`;
    if (!programCache[key]) {
      programCache[key] = new GpuProgram(options);
    }
    return programCache[key];
  }
}
const UNIFORM_TYPES_VALUES = [
  "f32",
  "i32",
  "vec2<f32>",
  "vec3<f32>",
  "vec4<f32>",
  "mat2x2<f32>",
  "mat3x3<f32>",
  "mat4x4<f32>",
  "mat3x2<f32>",
  "mat4x2<f32>",
  "mat2x3<f32>",
  "mat4x3<f32>",
  "mat2x4<f32>",
  "mat3x4<f32>",
  "vec2<i32>",
  "vec3<i32>",
  "vec4<i32>"
];
const UNIFORM_TYPES_MAP = UNIFORM_TYPES_VALUES.reduce((acc, type) => {
  acc[type] = true;
  return acc;
}, {});
function getDefaultUniformValue(type, size) {
  switch (type) {
    case "f32":
      return 0;
    case "vec2<f32>":
      return new Float32Array(2 * size);
    case "vec3<f32>":
      return new Float32Array(3 * size);
    case "vec4<f32>":
      return new Float32Array(4 * size);
    case "mat2x2<f32>":
      return new Float32Array([
        1,
        0,
        0,
        1
      ]);
    case "mat3x3<f32>":
      return new Float32Array([
        1,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        1
      ]);
    case "mat4x4<f32>":
      return new Float32Array([
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1,
        0,
        0,
        0,
        0,
        1
      ]);
  }
  return null;
}
const _UniformGroup = class _UniformGroup2 {
  /**
   * Create a new Uniform group
   * @param uniformStructures - The structures of the uniform group
   * @param options - The optional parameters of this uniform group
   */
  constructor(uniformStructures, options) {
    this._touched = 0;
    this.uid = uid("uniform");
    this._resourceType = "uniformGroup";
    this._resourceId = uid("resource");
    this.isUniformGroup = true;
    this._dirtyId = 0;
    this.destroyed = false;
    options = { ..._UniformGroup2.defaultOptions, ...options };
    this.uniformStructures = uniformStructures;
    const uniforms = {};
    for (const i in uniformStructures) {
      const uniformData = uniformStructures[i];
      uniformData.name = i;
      uniformData.size = uniformData.size ?? 1;
      if (!UNIFORM_TYPES_MAP[uniformData.type]) {
        throw new Error(`Uniform type ${uniformData.type} is not supported. Supported uniform types are: ${UNIFORM_TYPES_VALUES.join(", ")}`);
      }
      uniformData.value ?? (uniformData.value = getDefaultUniformValue(uniformData.type, uniformData.size));
      uniforms[i] = uniformData.value;
    }
    this.uniforms = uniforms;
    this._dirtyId = 1;
    this.ubo = options.ubo;
    this.isStatic = options.isStatic;
    this._signature = createIdFromString(Object.keys(uniforms).map(
      (i) => `${i}-${uniformStructures[i].type}`
    ).join("-"), "uniform-group");
  }
  /** Call this if you want the uniform groups data to be uploaded to the GPU only useful if `isStatic` is true. */
  update() {
    this._dirtyId++;
  }
};
_UniformGroup.defaultOptions = {
  /** if true the UniformGroup is handled as an Uniform buffer object. */
  ubo: false,
  /** if true, then you are responsible for when the data is uploaded to the GPU by calling `update()` */
  isStatic: false
};
let UniformGroup = _UniformGroup;
class BindGroup {
  /**
   * Create a new instance eof the Bind Group.
   * @param resources - The resources that are bound together for use by a shader.
   */
  constructor(resources) {
    this.resources = /* @__PURE__ */ Object.create(null);
    this._dirty = true;
    let index = 0;
    for (const i in resources) {
      const resource = resources[i];
      this.setResource(resource, index++);
    }
    this._updateKey();
  }
  /**
   * Updates the key if its flagged as dirty. This is used internally to
   * match this bind group to a WebGPU BindGroup.
   * @internal
   * @ignore
   */
  _updateKey() {
    if (!this._dirty)
      return;
    this._dirty = false;
    const keyParts = [];
    let index = 0;
    for (const i in this.resources) {
      keyParts[index++] = this.resources[i]._resourceId;
    }
    this._key = keyParts.join("|");
  }
  /**
   * Set a resource at a given index. this function will
   * ensure that listeners will be removed from the current resource
   * and added to the new resource.
   * @param resource - The resource to set.
   * @param index - The index to set the resource at.
   */
  setResource(resource, index) {
    var _a, _b;
    const currentResource = this.resources[index];
    if (resource === currentResource)
      return;
    if (currentResource) {
      (_a = resource.off) == null ? void 0 : _a.call(resource, "change", this.onResourceChange, this);
    }
    (_b = resource.on) == null ? void 0 : _b.call(resource, "change", this.onResourceChange, this);
    this.resources[index] = resource;
    this._dirty = true;
  }
  /**
   * Returns the resource at the current specified index.
   * @param index - The index of the resource to get.
   * @returns - The resource at the specified index.
   */
  getResource(index) {
    return this.resources[index];
  }
  /**
   * Used internally to 'touch' each resource, to ensure that the GC
   * knows that all resources in this bind group are still being used.
   * @param tick - The current tick.
   * @internal
   * @ignore
   */
  _touch(tick) {
    const resources = this.resources;
    for (const i in resources) {
      resources[i]._touched = tick;
    }
  }
  /** Destroys this bind group and removes all listeners. */
  destroy() {
    var _a;
    const resources = this.resources;
    for (const i in resources) {
      const resource = resources[i];
      (_a = resource.off) == null ? void 0 : _a.call(resource, "change", this.onResourceChange, this);
    }
    this.resources = null;
  }
  onResourceChange(resource) {
    this._dirty = true;
    if (resource.destroyed) {
      const resources = this.resources;
      for (const i in resources) {
        if (resources[i] === resource) {
          resources[i] = null;
        }
      }
    } else {
      this._updateKey();
    }
  }
}
var RendererType = /* @__PURE__ */ ((RendererType2) => {
  RendererType2[RendererType2["WEBGL"] = 1] = "WEBGL";
  RendererType2[RendererType2["WEBGPU"] = 2] = "WEBGPU";
  RendererType2[RendererType2["BOTH"] = 3] = "BOTH";
  return RendererType2;
})(RendererType || {});
class Shader extends EventEmitter {
  constructor(options) {
    super();
    this.uid = uid("shader");
    this._uniformBindMap = /* @__PURE__ */ Object.create(null);
    this._ownedBindGroups = [];
    let {
      gpuProgram,
      glProgram,
      groups,
      resources,
      compatibleRenderers,
      groupMap
    } = options;
    this.gpuProgram = gpuProgram;
    this.glProgram = glProgram;
    if (compatibleRenderers === void 0) {
      compatibleRenderers = 0;
      if (gpuProgram)
        compatibleRenderers |= RendererType.WEBGPU;
      if (glProgram)
        compatibleRenderers |= RendererType.WEBGL;
    }
    this.compatibleRenderers = compatibleRenderers;
    const nameHash = {};
    if (!resources && !groups) {
      resources = {};
    }
    if (resources && groups) {
      throw new Error("[Shader] Cannot have both resources and groups");
    } else if (!gpuProgram && groups && !groupMap) {
      throw new Error("[Shader] No group map or WebGPU shader provided - consider using resources instead.");
    } else if (!gpuProgram && groups && groupMap) {
      for (const i in groupMap) {
        for (const j in groupMap[i]) {
          const uniformName = groupMap[i][j];
          nameHash[uniformName] = {
            group: i,
            binding: j,
            name: uniformName
          };
        }
      }
    } else if (gpuProgram && groups && !groupMap) {
      const groupData = gpuProgram.structsAndGroups.groups;
      groupMap = {};
      groupData.forEach((data) => {
        groupMap[data.group] = groupMap[data.group] || {};
        groupMap[data.group][data.binding] = data.name;
        nameHash[data.name] = data;
      });
    } else if (resources) {
      groups = {};
      groupMap = {};
      if (gpuProgram) {
        const groupData = gpuProgram.structsAndGroups.groups;
        groupData.forEach((data) => {
          groupMap[data.group] = groupMap[data.group] || {};
          groupMap[data.group][data.binding] = data.name;
          nameHash[data.name] = data;
        });
      }
      let bindTick = 0;
      for (const i in resources) {
        if (nameHash[i])
          continue;
        if (!groups[99]) {
          groups[99] = new BindGroup();
          this._ownedBindGroups.push(groups[99]);
        }
        nameHash[i] = { group: 99, binding: bindTick, name: i };
        groupMap[99] = groupMap[99] || {};
        groupMap[99][bindTick] = i;
        bindTick++;
      }
      for (const i in resources) {
        const name = i;
        let value = resources[i];
        if (!value.source && !value._resourceType) {
          value = new UniformGroup(value);
        }
        const data = nameHash[name];
        if (data) {
          if (!groups[data.group]) {
            groups[data.group] = new BindGroup();
            this._ownedBindGroups.push(groups[data.group]);
          }
          groups[data.group].setResource(value, data.binding);
        }
      }
    }
    this.groups = groups;
    this._uniformBindMap = groupMap;
    this.resources = this._buildResourceAccessor(groups, nameHash);
  }
  /**
   * Sometimes a resource group will be provided later (for example global uniforms)
   * In such cases, this method can be used to let the shader know about the group.
   * @param name - the name of the resource group
   * @param groupIndex - the index of the group (should match the webGPU shader group location)
   * @param bindIndex - the index of the bind point (should match the webGPU shader bind point)
   */
  addResource(name, groupIndex, bindIndex) {
    var _a, _b;
    (_a = this._uniformBindMap)[groupIndex] || (_a[groupIndex] = {});
    (_b = this._uniformBindMap[groupIndex])[bindIndex] || (_b[bindIndex] = name);
    if (!this.groups[groupIndex]) {
      this.groups[groupIndex] = new BindGroup();
      this._ownedBindGroups.push(this.groups[groupIndex]);
    }
  }
  _buildResourceAccessor(groups, nameHash) {
    const uniformsOut = {};
    for (const i in nameHash) {
      const data = nameHash[i];
      Object.defineProperty(uniformsOut, data.name, {
        get() {
          return groups[data.group].getResource(data.binding);
        },
        set(value) {
          groups[data.group].setResource(value, data.binding);
        }
      });
    }
    return uniformsOut;
  }
  /**
   * Use to destroy the shader when its not longer needed.
   * It will destroy the resources and remove listeners.
   * @param destroyPrograms - if the programs should be destroyed as well.
   * Make sure its not being used by other shaders!
   */
  destroy(destroyPrograms = false) {
    var _a, _b;
    this.emit("destroy", this);
    if (destroyPrograms) {
      (_a = this.gpuProgram) == null ? void 0 : _a.destroy();
      (_b = this.glProgram) == null ? void 0 : _b.destroy();
    }
    this.gpuProgram = null;
    this.glProgram = null;
    this.removeAllListeners();
    this._uniformBindMap = null;
    this._ownedBindGroups.forEach((bindGroup) => {
      bindGroup.destroy();
    });
    this._ownedBindGroups = null;
    this.resources = null;
    this.groups = null;
  }
  static from(options) {
    const { gpu, gl, ...rest } = options;
    let gpuProgram;
    let glProgram;
    if (gpu) {
      gpuProgram = GpuProgram.from(gpu);
    }
    if (gl) {
      glProgram = GlProgram.from(gl);
    }
    return new Shader({
      gpuProgram,
      glProgram,
      ...rest
    });
  }
}
const blendModeIds = {
  normal: 0,
  add: 1,
  multiply: 2,
  screen: 3,
  overlay: 4,
  erase: 5,
  "normal-npm": 6,
  "add-npm": 7,
  "screen-npm": 8,
  min: 9,
  max: 10
};
const BLEND = 0;
const OFFSET = 1;
const CULLING = 2;
const DEPTH_TEST = 3;
const WINDING = 4;
const DEPTH_MASK = 5;
const _State = class _State2 {
  constructor() {
    this.data = 0;
    this.blendMode = "normal";
    this.polygonOffset = 0;
    this.blend = true;
    this.depthMask = true;
  }
  /**
   * Activates blending of the computed fragment color values.
   * @default true
   */
  get blend() {
    return !!(this.data & 1 << BLEND);
  }
  set blend(value) {
    if (!!(this.data & 1 << BLEND) !== value) {
      this.data ^= 1 << BLEND;
    }
  }
  /**
   * Activates adding an offset to depth values of polygon's fragments
   * @default false
   */
  get offsets() {
    return !!(this.data & 1 << OFFSET);
  }
  set offsets(value) {
    if (!!(this.data & 1 << OFFSET) !== value) {
      this.data ^= 1 << OFFSET;
    }
  }
  /** The culling settings for this state none - No culling back - Back face culling front - Front face culling */
  set cullMode(value) {
    if (value === "none") {
      this.culling = false;
      return;
    }
    this.culling = true;
    this.clockwiseFrontFace = value === "front";
  }
  get cullMode() {
    if (!this.culling) {
      return "none";
    }
    return this.clockwiseFrontFace ? "front" : "back";
  }
  /**
   * Activates culling of polygons.
   * @default false
   */
  get culling() {
    return !!(this.data & 1 << CULLING);
  }
  set culling(value) {
    if (!!(this.data & 1 << CULLING) !== value) {
      this.data ^= 1 << CULLING;
    }
  }
  /**
   * Activates depth comparisons and updates to the depth buffer.
   * @default false
   */
  get depthTest() {
    return !!(this.data & 1 << DEPTH_TEST);
  }
  set depthTest(value) {
    if (!!(this.data & 1 << DEPTH_TEST) !== value) {
      this.data ^= 1 << DEPTH_TEST;
    }
  }
  /**
   * Enables or disables writing to the depth buffer.
   * @default true
   */
  get depthMask() {
    return !!(this.data & 1 << DEPTH_MASK);
  }
  set depthMask(value) {
    if (!!(this.data & 1 << DEPTH_MASK) !== value) {
      this.data ^= 1 << DEPTH_MASK;
    }
  }
  /**
   * Specifies whether or not front or back-facing polygons can be culled.
   * @default false
   */
  get clockwiseFrontFace() {
    return !!(this.data & 1 << WINDING);
  }
  set clockwiseFrontFace(value) {
    if (!!(this.data & 1 << WINDING) !== value) {
      this.data ^= 1 << WINDING;
    }
  }
  /**
   * The blend mode to be applied when this state is set. Apply a value of `normal` to reset the blend mode.
   * Setting this mode to anything other than NO_BLEND will automatically switch blending on.
   * @default 'normal'
   */
  get blendMode() {
    return this._blendMode;
  }
  set blendMode(value) {
    this.blend = value !== "none";
    this._blendMode = value;
    this._blendModeId = blendModeIds[value] || 0;
  }
  /**
   * The polygon offset. Setting this property to anything other than 0 will automatically enable polygon offset fill.
   * @default 0
   */
  get polygonOffset() {
    return this._polygonOffset;
  }
  set polygonOffset(value) {
    this.offsets = !!value;
    this._polygonOffset = value;
  }
  toString() {
    return `[pixi.js/core:State blendMode=${this.blendMode} clockwiseFrontFace=${this.clockwiseFrontFace} culling=${this.culling} depthMask=${this.depthMask} polygonOffset=${this.polygonOffset}]`;
  }
  /**
   * A quickly getting an instance of a State that is configured for 2d rendering.
   * @returns a new State with values set for 2d rendering
   */
  static for2d() {
    const state = new _State2();
    state.depthTest = false;
    state.blend = true;
    return state;
  }
};
_State.default2d = _State.for2d();
let State = _State;
const fragTemplate = [
  "precision mediump float;",
  "void main(void){",
  "float test = 0.1;",
  "%forloop%",
  "gl_FragColor = vec4(0.0);",
  "}"
].join("\n");
function generateIfTestSrc(maxIfs) {
  let src = "";
  for (let i = 0; i < maxIfs; ++i) {
    if (i > 0) {
      src += "\nelse ";
    }
    if (i < maxIfs - 1) {
      src += `if(test == ${i}.0){}`;
    }
  }
  return src;
}
function checkMaxIfStatementsInShader(maxIfs, gl) {
  if (maxIfs === 0) {
    throw new Error("Invalid value of `0` passed to `checkMaxIfStatementsInShader`");
  }
  const shader = gl.createShader(gl.FRAGMENT_SHADER);
  try {
    while (true) {
      const fragmentSrc = fragTemplate.replace(/%forloop%/gi, generateIfTestSrc(maxIfs));
      gl.shaderSource(shader, fragmentSrc);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        maxIfs = maxIfs / 2 | 0;
      } else {
        break;
      }
    }
  } finally {
    gl.deleteShader(shader);
  }
  return maxIfs;
}
let maxTexturesPerBatchCache = null;
function getMaxTexturesPerBatch() {
  var _a;
  if (maxTexturesPerBatchCache)
    return maxTexturesPerBatchCache;
  const gl = getTestContext();
  maxTexturesPerBatchCache = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
  maxTexturesPerBatchCache = checkMaxIfStatementsInShader(
    maxTexturesPerBatchCache,
    gl
  );
  (_a = gl.getExtension("WEBGL_lose_context")) == null ? void 0 : _a.loseContext();
  return maxTexturesPerBatchCache;
}
class ViewableBuffer {
  constructor(sizeOrBuffer) {
    if (typeof sizeOrBuffer === "number") {
      this.rawBinaryData = new ArrayBuffer(sizeOrBuffer);
    } else if (sizeOrBuffer instanceof Uint8Array) {
      this.rawBinaryData = sizeOrBuffer.buffer;
    } else {
      this.rawBinaryData = sizeOrBuffer;
    }
    this.uint32View = new Uint32Array(this.rawBinaryData);
    this.float32View = new Float32Array(this.rawBinaryData);
    this.size = this.rawBinaryData.byteLength;
  }
  /** View on the raw binary data as a `Int8Array`. */
  get int8View() {
    if (!this._int8View) {
      this._int8View = new Int8Array(this.rawBinaryData);
    }
    return this._int8View;
  }
  /** View on the raw binary data as a `Uint8Array`. */
  get uint8View() {
    if (!this._uint8View) {
      this._uint8View = new Uint8Array(this.rawBinaryData);
    }
    return this._uint8View;
  }
  /**  View on the raw binary data as a `Int16Array`. */
  get int16View() {
    if (!this._int16View) {
      this._int16View = new Int16Array(this.rawBinaryData);
    }
    return this._int16View;
  }
  /** View on the raw binary data as a `Int32Array`. */
  get int32View() {
    if (!this._int32View) {
      this._int32View = new Int32Array(this.rawBinaryData);
    }
    return this._int32View;
  }
  /** View on the raw binary data as a `Float64Array`. */
  get float64View() {
    if (!this._float64Array) {
      this._float64Array = new Float64Array(this.rawBinaryData);
    }
    return this._float64Array;
  }
  /** View on the raw binary data as a `BigUint64Array`. */
  get bigUint64View() {
    if (!this._bigUint64Array) {
      this._bigUint64Array = new BigUint64Array(this.rawBinaryData);
    }
    return this._bigUint64Array;
  }
  /**
   * Returns the view of the given type.
   * @param type - One of `int8`, `uint8`, `int16`,
   *    `uint16`, `int32`, `uint32`, and `float32`.
   * @returns - typed array of given type
   */
  view(type) {
    return this[`${type}View`];
  }
  /** Destroys all buffer references. Do not use after calling this. */
  destroy() {
    this.rawBinaryData = null;
    this._int8View = null;
    this._uint8View = null;
    this._int16View = null;
    this.uint16View = null;
    this._int32View = null;
    this.uint32View = null;
    this.float32View = null;
  }
  /**
   * Returns the size of the given type in bytes.
   * @param type - One of `int8`, `uint8`, `int16`,
   *   `uint16`, `int32`, `uint32`, and `float32`.
   * @returns - size of the type in bytes
   */
  static sizeOf(type) {
    switch (type) {
      case "int8":
      case "uint8":
        return 1;
      case "int16":
      case "uint16":
        return 2;
      case "int32":
      case "uint32":
      case "float32":
        return 4;
      default:
        throw new Error(`${type} isn't a valid view type`);
    }
  }
}
function fastCopy(sourceBuffer, destinationBuffer) {
  const lengthDouble = sourceBuffer.byteLength / 8 | 0;
  const sourceFloat64View = new Float64Array(sourceBuffer, 0, lengthDouble);
  const destinationFloat64View = new Float64Array(destinationBuffer, 0, lengthDouble);
  destinationFloat64View.set(sourceFloat64View);
  const remainingBytes = sourceBuffer.byteLength - lengthDouble * 8;
  if (remainingBytes > 0) {
    const sourceUint8View = new Uint8Array(sourceBuffer, lengthDouble * 8, remainingBytes);
    const destinationUint8View = new Uint8Array(destinationBuffer, lengthDouble * 8, remainingBytes);
    destinationUint8View.set(sourceUint8View);
  }
}
const BLEND_TO_NPM = {
  normal: "normal-npm",
  add: "add-npm",
  screen: "screen-npm"
};
var STENCIL_MODES = /* @__PURE__ */ ((STENCIL_MODES2) => {
  STENCIL_MODES2[STENCIL_MODES2["DISABLED"] = 0] = "DISABLED";
  STENCIL_MODES2[STENCIL_MODES2["RENDERING_MASK_ADD"] = 1] = "RENDERING_MASK_ADD";
  STENCIL_MODES2[STENCIL_MODES2["MASK_ACTIVE"] = 2] = "MASK_ACTIVE";
  STENCIL_MODES2[STENCIL_MODES2["INVERSE_MASK_ACTIVE"] = 3] = "INVERSE_MASK_ACTIVE";
  STENCIL_MODES2[STENCIL_MODES2["RENDERING_MASK_REMOVE"] = 4] = "RENDERING_MASK_REMOVE";
  STENCIL_MODES2[STENCIL_MODES2["NONE"] = 5] = "NONE";
  return STENCIL_MODES2;
})(STENCIL_MODES || {});
function getAdjustedBlendModeBlend(blendMode, textureSource) {
  if (textureSource.alphaMode === "no-premultiply-alpha") {
    return BLEND_TO_NPM[blendMode] || blendMode;
  }
  return blendMode;
}
class BatchTextureArray {
  constructor() {
    this.ids = /* @__PURE__ */ Object.create(null);
    this.textures = [];
    this.count = 0;
  }
  /** Clear the textures and their locations. */
  clear() {
    for (let i = 0; i < this.count; i++) {
      const t = this.textures[i];
      this.textures[i] = null;
      this.ids[t.uid] = null;
    }
    this.count = 0;
  }
}
class Batch {
  constructor() {
    this.renderPipeId = "batch";
    this.action = "startBatch";
    this.start = 0;
    this.size = 0;
    this.textures = new BatchTextureArray();
    this.blendMode = "normal";
    this.topology = "triangle-strip";
    this.canBundle = true;
  }
  destroy() {
    this.textures = null;
    this.gpuBindGroup = null;
    this.bindGroup = null;
    this.batcher = null;
  }
}
const batchPool = [];
let batchPoolIndex = 0;
function getBatchFromPool() {
  return batchPoolIndex > 0 ? batchPool[--batchPoolIndex] : new Batch();
}
function returnBatchToPool(batch) {
  batchPool[batchPoolIndex++] = batch;
}
let BATCH_TICK = 0;
const _Batcher = class _Batcher2 {
  constructor(options = {}) {
    this.uid = uid("batcher");
    this.dirty = true;
    this.batchIndex = 0;
    this.batches = [];
    this._elements = [];
    _Batcher2.defaultOptions.maxTextures = _Batcher2.defaultOptions.maxTextures ?? getMaxTexturesPerBatch();
    options = { ..._Batcher2.defaultOptions, ...options };
    const { maxTextures, attributesInitialSize, indicesInitialSize } = options;
    this.attributeBuffer = new ViewableBuffer(attributesInitialSize * 4);
    this.indexBuffer = new Uint16Array(indicesInitialSize);
    this.maxTextures = maxTextures;
  }
  begin() {
    this.elementSize = 0;
    this.elementStart = 0;
    this.indexSize = 0;
    this.attributeSize = 0;
    for (let i = 0; i < this.batchIndex; i++) {
      returnBatchToPool(this.batches[i]);
    }
    this.batchIndex = 0;
    this._batchIndexStart = 0;
    this._batchIndexSize = 0;
    this.dirty = true;
  }
  add(batchableObject) {
    this._elements[this.elementSize++] = batchableObject;
    batchableObject._indexStart = this.indexSize;
    batchableObject._attributeStart = this.attributeSize;
    batchableObject._batcher = this;
    this.indexSize += batchableObject.indexSize;
    this.attributeSize += batchableObject.attributeSize * this.vertexSize;
  }
  checkAndUpdateTexture(batchableObject, texture) {
    const textureId = batchableObject._batch.textures.ids[texture._source.uid];
    if (!textureId && textureId !== 0)
      return false;
    batchableObject._textureId = textureId;
    batchableObject.texture = texture;
    return true;
  }
  updateElement(batchableObject) {
    this.dirty = true;
    const attributeBuffer = this.attributeBuffer;
    if (batchableObject.packAsQuad) {
      this.packQuadAttributes(
        batchableObject,
        attributeBuffer.float32View,
        attributeBuffer.uint32View,
        batchableObject._attributeStart,
        batchableObject._textureId
      );
    } else {
      this.packAttributes(
        batchableObject,
        attributeBuffer.float32View,
        attributeBuffer.uint32View,
        batchableObject._attributeStart,
        batchableObject._textureId
      );
    }
  }
  /**
   * breaks the batcher. This happens when a batch gets too big,
   * or we need to switch to a different type of rendering (a filter for example)
   * @param instructionSet
   */
  break(instructionSet) {
    const elements = this._elements;
    if (!elements[this.elementStart])
      return;
    let batch = getBatchFromPool();
    let textureBatch = batch.textures;
    textureBatch.clear();
    const firstElement = elements[this.elementStart];
    let blendMode = getAdjustedBlendModeBlend(firstElement.blendMode, firstElement.texture._source);
    let topology = firstElement.topology;
    if (this.attributeSize * 4 > this.attributeBuffer.size) {
      this._resizeAttributeBuffer(this.attributeSize * 4);
    }
    if (this.indexSize > this.indexBuffer.length) {
      this._resizeIndexBuffer(this.indexSize);
    }
    const f32 = this.attributeBuffer.float32View;
    const u32 = this.attributeBuffer.uint32View;
    const indexBuffer = this.indexBuffer;
    let size = this._batchIndexSize;
    let start = this._batchIndexStart;
    let action = "startBatch";
    const maxTextures = this.maxTextures;
    for (let i = this.elementStart; i < this.elementSize; ++i) {
      const element = elements[i];
      elements[i] = null;
      const texture = element.texture;
      const source = texture._source;
      const adjustedBlendMode = getAdjustedBlendModeBlend(element.blendMode, source);
      const breakRequired = blendMode !== adjustedBlendMode || topology !== element.topology;
      if (source._batchTick === BATCH_TICK && !breakRequired) {
        element._textureId = source._textureBindLocation;
        size += element.indexSize;
        if (element.packAsQuad) {
          this.packQuadAttributes(
            element,
            f32,
            u32,
            element._attributeStart,
            element._textureId
          );
          this.packQuadIndex(
            indexBuffer,
            element._indexStart,
            element._attributeStart / this.vertexSize
          );
        } else {
          this.packAttributes(
            element,
            f32,
            u32,
            element._attributeStart,
            element._textureId
          );
          this.packIndex(
            element,
            indexBuffer,
            element._indexStart,
            element._attributeStart / this.vertexSize
          );
        }
        element._batch = batch;
        continue;
      }
      source._batchTick = BATCH_TICK;
      if (textureBatch.count >= maxTextures || breakRequired) {
        this._finishBatch(
          batch,
          start,
          size - start,
          textureBatch,
          blendMode,
          topology,
          instructionSet,
          action
        );
        action = "renderBatch";
        start = size;
        blendMode = adjustedBlendMode;
        topology = element.topology;
        batch = getBatchFromPool();
        textureBatch = batch.textures;
        textureBatch.clear();
        ++BATCH_TICK;
      }
      element._textureId = source._textureBindLocation = textureBatch.count;
      textureBatch.ids[source.uid] = textureBatch.count;
      textureBatch.textures[textureBatch.count++] = source;
      element._batch = batch;
      size += element.indexSize;
      if (element.packAsQuad) {
        this.packQuadAttributes(
          element,
          f32,
          u32,
          element._attributeStart,
          element._textureId
        );
        this.packQuadIndex(
          indexBuffer,
          element._indexStart,
          element._attributeStart / this.vertexSize
        );
      } else {
        this.packAttributes(
          element,
          f32,
          u32,
          element._attributeStart,
          element._textureId
        );
        this.packIndex(
          element,
          indexBuffer,
          element._indexStart,
          element._attributeStart / this.vertexSize
        );
      }
    }
    if (textureBatch.count > 0) {
      this._finishBatch(
        batch,
        start,
        size - start,
        textureBatch,
        blendMode,
        topology,
        instructionSet,
        action
      );
      start = size;
      ++BATCH_TICK;
    }
    this.elementStart = this.elementSize;
    this._batchIndexStart = start;
    this._batchIndexSize = size;
  }
  _finishBatch(batch, indexStart, indexSize, textureBatch, blendMode, topology, instructionSet, action) {
    batch.gpuBindGroup = null;
    batch.bindGroup = null;
    batch.action = action;
    batch.batcher = this;
    batch.textures = textureBatch;
    batch.blendMode = blendMode;
    batch.topology = topology;
    batch.start = indexStart;
    batch.size = indexSize;
    ++BATCH_TICK;
    this.batches[this.batchIndex++] = batch;
    instructionSet.add(batch);
  }
  finish(instructionSet) {
    this.break(instructionSet);
  }
  /**
   * Resizes the attribute buffer to the given size (1 = 1 float32)
   * @param size - the size in vertices to ensure (not bytes!)
   */
  ensureAttributeBuffer(size) {
    if (size * 4 <= this.attributeBuffer.size)
      return;
    this._resizeAttributeBuffer(size * 4);
  }
  /**
   * Resizes the index buffer to the given size (1 = 1 float32)
   * @param size - the size in vertices to ensure (not bytes!)
   */
  ensureIndexBuffer(size) {
    if (size <= this.indexBuffer.length)
      return;
    this._resizeIndexBuffer(size);
  }
  _resizeAttributeBuffer(size) {
    const newSize = Math.max(size, this.attributeBuffer.size * 2);
    const newArrayBuffer = new ViewableBuffer(newSize);
    fastCopy(this.attributeBuffer.rawBinaryData, newArrayBuffer.rawBinaryData);
    this.attributeBuffer = newArrayBuffer;
  }
  _resizeIndexBuffer(size) {
    const indexBuffer = this.indexBuffer;
    let newSize = Math.max(size, indexBuffer.length * 1.5);
    newSize += newSize % 2;
    const newIndexBuffer = newSize > 65535 ? new Uint32Array(newSize) : new Uint16Array(newSize);
    if (newIndexBuffer.BYTES_PER_ELEMENT !== indexBuffer.BYTES_PER_ELEMENT) {
      for (let i = 0; i < indexBuffer.length; i++) {
        newIndexBuffer[i] = indexBuffer[i];
      }
    } else {
      fastCopy(indexBuffer.buffer, newIndexBuffer.buffer);
    }
    this.indexBuffer = newIndexBuffer;
  }
  packQuadIndex(indexBuffer, index, indicesOffset) {
    indexBuffer[index] = indicesOffset + 0;
    indexBuffer[index + 1] = indicesOffset + 1;
    indexBuffer[index + 2] = indicesOffset + 2;
    indexBuffer[index + 3] = indicesOffset + 0;
    indexBuffer[index + 4] = indicesOffset + 2;
    indexBuffer[index + 5] = indicesOffset + 3;
  }
  packIndex(element, indexBuffer, index, indicesOffset) {
    const indices = element.indices;
    const size = element.indexSize;
    const indexOffset = element.indexOffset;
    const attributeOffset = element.attributeOffset;
    for (let i = 0; i < size; i++) {
      indexBuffer[index++] = indicesOffset + indices[i + indexOffset] - attributeOffset;
    }
  }
  destroy() {
    for (let i = 0; i < this.batches.length; i++) {
      returnBatchToPool(this.batches[i]);
    }
    this.batches = null;
    for (let i = 0; i < this._elements.length; i++) {
      this._elements[i]._batch = null;
    }
    this._elements = null;
    this.indexBuffer = null;
    this.attributeBuffer.destroy();
    this.attributeBuffer = null;
  }
};
_Batcher.defaultOptions = {
  maxTextures: null,
  attributesInitialSize: 4,
  indicesInitialSize: 6
};
let Batcher = _Batcher;
var BufferUsage = /* @__PURE__ */ ((BufferUsage2) => {
  BufferUsage2[BufferUsage2["MAP_READ"] = 1] = "MAP_READ";
  BufferUsage2[BufferUsage2["MAP_WRITE"] = 2] = "MAP_WRITE";
  BufferUsage2[BufferUsage2["COPY_SRC"] = 4] = "COPY_SRC";
  BufferUsage2[BufferUsage2["COPY_DST"] = 8] = "COPY_DST";
  BufferUsage2[BufferUsage2["INDEX"] = 16] = "INDEX";
  BufferUsage2[BufferUsage2["VERTEX"] = 32] = "VERTEX";
  BufferUsage2[BufferUsage2["UNIFORM"] = 64] = "UNIFORM";
  BufferUsage2[BufferUsage2["STORAGE"] = 128] = "STORAGE";
  BufferUsage2[BufferUsage2["INDIRECT"] = 256] = "INDIRECT";
  BufferUsage2[BufferUsage2["QUERY_RESOLVE"] = 512] = "QUERY_RESOLVE";
  BufferUsage2[BufferUsage2["STATIC"] = 1024] = "STATIC";
  return BufferUsage2;
})(BufferUsage || {});
class Buffer extends EventEmitter {
  /**
   * Creates a new Buffer with the given options
   * @param options - the options for the buffer
   */
  constructor(options) {
    let { data, size } = options;
    const { usage, label, shrinkToFit } = options;
    super();
    this.uid = uid("buffer");
    this._resourceType = "buffer";
    this._resourceId = uid("resource");
    this._touched = 0;
    this._updateID = 1;
    this._dataInt32 = null;
    this.shrinkToFit = true;
    this.destroyed = false;
    if (data instanceof Array) {
      data = new Float32Array(data);
    }
    this._data = data;
    size ?? (size = data == null ? void 0 : data.byteLength);
    const mappedAtCreation = !!data;
    this.descriptor = {
      size,
      usage,
      mappedAtCreation,
      label
    };
    this.shrinkToFit = shrinkToFit ?? true;
  }
  /** the data in the buffer */
  get data() {
    return this._data;
  }
  set data(value) {
    this.setDataWithSize(value, value.length, true);
  }
  get dataInt32() {
    if (!this._dataInt32) {
      this._dataInt32 = new Int32Array(this.data.buffer);
    }
    return this._dataInt32;
  }
  /** whether the buffer is static or not */
  get static() {
    return !!(this.descriptor.usage & BufferUsage.STATIC);
  }
  set static(value) {
    if (value) {
      this.descriptor.usage |= BufferUsage.STATIC;
    } else {
      this.descriptor.usage &= ~BufferUsage.STATIC;
    }
  }
  /**
   * Sets the data in the buffer to the given value. This will immediately update the buffer on the GPU.
   * If you only want to update a subset of the buffer, you can pass in the size of the data.
   * @param value - the data to set
   * @param size - the size of the data in bytes
   * @param syncGPU - should the buffer be updated on the GPU immediately?
   */
  setDataWithSize(value, size, syncGPU) {
    this._updateID++;
    this._updateSize = size * value.BYTES_PER_ELEMENT;
    if (this._data === value) {
      if (syncGPU)
        this.emit("update", this);
      return;
    }
    const oldData = this._data;
    this._data = value;
    this._dataInt32 = null;
    if (!oldData || oldData.length !== value.length) {
      if (!this.shrinkToFit && oldData && value.byteLength < oldData.byteLength) {
        if (syncGPU)
          this.emit("update", this);
      } else {
        this.descriptor.size = value.byteLength;
        this._resourceId = uid("resource");
        this.emit("change", this);
      }
      return;
    }
    if (syncGPU)
      this.emit("update", this);
  }
  /**
   * updates the buffer on the GPU to reflect the data in the buffer.
   * By default it will update the entire buffer. If you only want to update a subset of the buffer,
   * you can pass in the size of the buffer to update.
   * @param sizeInBytes - the new size of the buffer in bytes
   */
  update(sizeInBytes) {
    this._updateSize = sizeInBytes ?? this._updateSize;
    this._updateID++;
    this.emit("update", this);
  }
  /** Destroys the buffer */
  destroy() {
    this.destroyed = true;
    this.emit("destroy", this);
    this.emit("change", this);
    this._data = null;
    this.descriptor = null;
    this.removeAllListeners();
  }
}
function ensureIsBuffer(buffer, index) {
  if (!(buffer instanceof Buffer)) {
    let usage = index ? BufferUsage.INDEX : BufferUsage.VERTEX;
    if (buffer instanceof Array) {
      if (index) {
        buffer = new Uint32Array(buffer);
        usage = BufferUsage.INDEX | BufferUsage.COPY_DST;
      } else {
        buffer = new Float32Array(buffer);
        usage = BufferUsage.VERTEX | BufferUsage.COPY_DST;
      }
    }
    buffer = new Buffer({
      data: buffer,
      label: index ? "index-mesh-buffer" : "vertex-mesh-buffer",
      usage
    });
  }
  return buffer;
}
function getGeometryBounds(geometry, attributeId, bounds) {
  const attribute = geometry.getAttribute(attributeId);
  if (!attribute) {
    bounds.minX = 0;
    bounds.minY = 0;
    bounds.maxX = 0;
    bounds.maxY = 0;
    return bounds;
  }
  const data = attribute.buffer.data;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  const byteSize = data.BYTES_PER_ELEMENT;
  const offset = (attribute.offset || 0) / byteSize;
  const stride = (attribute.stride || 2 * 4) / byteSize;
  for (let i = offset; i < data.length; i += stride) {
    const x = data[i];
    const y = data[i + 1];
    if (x > maxX)
      maxX = x;
    if (y > maxY)
      maxY = y;
    if (x < minX)
      minX = x;
    if (y < minY)
      minY = y;
  }
  bounds.minX = minX;
  bounds.minY = minY;
  bounds.maxX = maxX;
  bounds.maxY = maxY;
  return bounds;
}
function ensureIsAttribute(attribute) {
  if (attribute instanceof Buffer || Array.isArray(attribute) || attribute.BYTES_PER_ELEMENT) {
    attribute = {
      buffer: attribute
    };
  }
  attribute.buffer = ensureIsBuffer(attribute.buffer, false);
  return attribute;
}
class Geometry extends EventEmitter {
  /**
   * Create a new instance of a geometry
   * @param options - The options for the geometry.
   */
  constructor(options = {}) {
    super();
    this.uid = uid("geometry");
    this._layoutKey = 0;
    this.instanceCount = 1;
    this._bounds = new Bounds();
    this._boundsDirty = true;
    const { attributes, indexBuffer, topology } = options;
    this.buffers = [];
    this.attributes = {};
    if (attributes) {
      for (const i in attributes) {
        this.addAttribute(i, attributes[i]);
      }
    }
    this.instanceCount = options.instanceCount ?? 1;
    if (indexBuffer) {
      this.addIndex(indexBuffer);
    }
    this.topology = topology || "triangle-list";
  }
  onBufferUpdate() {
    this._boundsDirty = true;
    this.emit("update", this);
  }
  /**
   * Returns the requested attribute.
   * @param id - The name of the attribute required
   * @returns - The attribute requested.
   */
  getAttribute(id) {
    return this.attributes[id];
  }
  /**
   * Returns the index buffer
   * @returns - The index buffer.
   */
  getIndex() {
    return this.indexBuffer;
  }
  /**
   * Returns the requested buffer.
   * @param id - The name of the buffer required.
   * @returns - The buffer requested.
   */
  getBuffer(id) {
    return this.getAttribute(id).buffer;
  }
  /**
   * Used to figure out how many vertices there are in this geometry
   * @returns the number of vertices in the geometry
   */
  getSize() {
    for (const i in this.attributes) {
      const attribute = this.attributes[i];
      const buffer = attribute.buffer;
      return buffer.data.length / (attribute.stride / 4 || attribute.size);
    }
    return 0;
  }
  /**
   * Adds an attribute to the geometry.
   * @param name - The name of the attribute to add.
   * @param attributeOption - The attribute option to add.
   */
  addAttribute(name, attributeOption) {
    const attribute = ensureIsAttribute(attributeOption);
    const bufferIndex = this.buffers.indexOf(attribute.buffer);
    if (bufferIndex === -1) {
      this.buffers.push(attribute.buffer);
      attribute.buffer.on("update", this.onBufferUpdate, this);
      attribute.buffer.on("change", this.onBufferUpdate, this);
    }
    this.attributes[name] = attribute;
  }
  /**
   * Adds an index buffer to the geometry.
   * @param indexBuffer - The index buffer to add. Can be a Buffer, TypedArray, or an array of numbers.
   */
  addIndex(indexBuffer) {
    this.indexBuffer = ensureIsBuffer(indexBuffer, true);
    this.buffers.push(this.indexBuffer);
  }
  /** Returns the bounds of the geometry. */
  get bounds() {
    if (!this._boundsDirty)
      return this._bounds;
    this._boundsDirty = false;
    return getGeometryBounds(this, "aPosition", this._bounds);
  }
  /**
   * destroys the geometry.
   * @param destroyBuffers - destroy the buffers associated with this geometry
   */
  destroy(destroyBuffers = false) {
    this.emit("destroy", this);
    this.removeAllListeners();
    if (destroyBuffers) {
      this.buffers.forEach((buffer) => buffer.destroy());
    }
    this.attributes = null;
    this.buffers = null;
    this.indexBuffer = null;
    this._bounds = null;
  }
}
const placeHolderBufferData = new Float32Array(1);
const placeHolderIndexData = new Uint32Array(1);
class BatchGeometry extends Geometry {
  constructor() {
    const vertexSize = 6;
    const attributeBuffer = new Buffer({
      data: placeHolderBufferData,
      label: "attribute-batch-buffer",
      usage: BufferUsage.VERTEX | BufferUsage.COPY_DST,
      shrinkToFit: false
    });
    const indexBuffer = new Buffer({
      data: placeHolderIndexData,
      label: "index-batch-buffer",
      usage: BufferUsage.INDEX | BufferUsage.COPY_DST,
      // | BufferUsage.STATIC,
      shrinkToFit: false
    });
    const stride = vertexSize * 4;
    super({
      attributes: {
        aPosition: {
          buffer: attributeBuffer,
          format: "float32x2",
          stride,
          offset: 0
        },
        aUV: {
          buffer: attributeBuffer,
          format: "float32x2",
          stride,
          offset: 2 * 4
        },
        aColor: {
          buffer: attributeBuffer,
          format: "unorm8x4",
          stride,
          offset: 4 * 4
        },
        aTextureIdAndRound: {
          buffer: attributeBuffer,
          format: "uint16x2",
          stride,
          offset: 5 * 4
        }
      },
      indexBuffer
    });
  }
}
function addBits(srcParts, parts, name) {
  if (srcParts) {
    for (const i in srcParts) {
      const id = i.toLocaleLowerCase();
      const part = parts[id];
      if (part) {
        let sanitisedPart = srcParts[i];
        if (i === "header") {
          sanitisedPart = sanitisedPart.replace(/@in\s+[^;]+;\s*/g, "").replace(/@out\s+[^;]+;\s*/g, "");
        }
        if (name) {
          part.push(`//----${name}----//`);
        }
        part.push(sanitisedPart);
      } else {
        warn(`${i} placement hook does not exist in shader`);
      }
    }
  }
}
const findHooksRx = /\{\{(.*?)\}\}/g;
function compileHooks(programSrc) {
  var _a;
  const parts = {};
  const partMatches = ((_a = programSrc.match(findHooksRx)) == null ? void 0 : _a.map((hook) => hook.replace(/[{()}]/g, ""))) ?? [];
  partMatches.forEach((hook) => {
    parts[hook] = [];
  });
  return parts;
}
function extractInputs(fragmentSource, out) {
  let match;
  const regex = /@in\s+([^;]+);/g;
  while ((match = regex.exec(fragmentSource)) !== null) {
    out.push(match[1]);
  }
}
function compileInputs(fragments, template, sort = false) {
  const results = [];
  extractInputs(template, results);
  fragments.forEach((fragment) => {
    if (fragment.header) {
      extractInputs(fragment.header, results);
    }
  });
  const mainInput = results;
  if (sort) {
    mainInput.sort();
  }
  const finalString = mainInput.map((inValue, i) => `       @location(${i}) ${inValue},`).join("\n");
  let cleanedString = template.replace(/@in\s+[^;]+;\s*/g, "");
  cleanedString = cleanedString.replace("{{in}}", `
${finalString}
`);
  return cleanedString;
}
function extractOutputs(fragmentSource, out) {
  let match;
  const regex = /@out\s+([^;]+);/g;
  while ((match = regex.exec(fragmentSource)) !== null) {
    out.push(match[1]);
  }
}
function extractVariableName(value) {
  const regex = /\b(\w+)\s*:/g;
  const match = regex.exec(value);
  return match ? match[1] : "";
}
function stripVariable(value) {
  const regex = /@.*?\s+/g;
  return value.replace(regex, "");
}
function compileOutputs(fragments, template) {
  const results = [];
  extractOutputs(template, results);
  fragments.forEach((fragment) => {
    if (fragment.header) {
      extractOutputs(fragment.header, results);
    }
  });
  let index = 0;
  const mainStruct = results.sort().map((inValue) => {
    if (inValue.indexOf("builtin") > -1) {
      return inValue;
    }
    return `@location(${index++}) ${inValue}`;
  }).join(",\n");
  const mainStart = results.sort().map((inValue) => `       var ${stripVariable(inValue)};`).join("\n");
  const mainEnd = `return VSOutput(
            ${results.sort().map((inValue) => ` ${extractVariableName(inValue)}`).join(",\n")});`;
  let compiledCode = template.replace(/@out\s+[^;]+;\s*/g, "");
  compiledCode = compiledCode.replace("{{struct}}", `
${mainStruct}
`);
  compiledCode = compiledCode.replace("{{start}}", `
${mainStart}
`);
  compiledCode = compiledCode.replace("{{return}}", `
${mainEnd}
`);
  return compiledCode;
}
function injectBits(templateSrc, fragmentParts) {
  let out = templateSrc;
  for (const i in fragmentParts) {
    const parts = fragmentParts[i];
    const toInject = parts.join("\n");
    if (toInject.length) {
      out = out.replace(`{{${i}}}`, `//-----${i} START-----//
${parts.join("\n")}
//----${i} FINISH----//`);
    } else {
      out = out.replace(`{{${i}}}`, "");
    }
  }
  return out;
}
const cacheMap = /* @__PURE__ */ Object.create(null);
const bitCacheMap = /* @__PURE__ */ new Map();
let CACHE_UID = 0;
function compileHighShader({
  template,
  bits
}) {
  const cacheId = generateCacheId(template, bits);
  if (cacheMap[cacheId])
    return cacheMap[cacheId];
  const { vertex, fragment } = compileInputsAndOutputs(template, bits);
  cacheMap[cacheId] = compileBits(vertex, fragment, bits);
  return cacheMap[cacheId];
}
function compileHighShaderGl({
  template,
  bits
}) {
  const cacheId = generateCacheId(template, bits);
  if (cacheMap[cacheId])
    return cacheMap[cacheId];
  cacheMap[cacheId] = compileBits(template.vertex, template.fragment, bits);
  return cacheMap[cacheId];
}
function compileInputsAndOutputs(template, bits) {
  const vertexFragments = bits.map((shaderBit) => shaderBit.vertex).filter((v) => !!v);
  const fragmentFragments = bits.map((shaderBit) => shaderBit.fragment).filter((v) => !!v);
  let compiledVertex = compileInputs(vertexFragments, template.vertex, true);
  compiledVertex = compileOutputs(vertexFragments, compiledVertex);
  const compiledFragment = compileInputs(fragmentFragments, template.fragment, true);
  return {
    vertex: compiledVertex,
    fragment: compiledFragment
  };
}
function generateCacheId(template, bits) {
  return bits.map((highFragment) => {
    if (!bitCacheMap.has(highFragment)) {
      bitCacheMap.set(highFragment, CACHE_UID++);
    }
    return bitCacheMap.get(highFragment);
  }).sort((a, b) => a - b).join("-") + template.vertex + template.fragment;
}
function compileBits(vertex, fragment, bits) {
  const vertexParts = compileHooks(vertex);
  const fragmentParts = compileHooks(fragment);
  bits.forEach((shaderBit) => {
    addBits(shaderBit.vertex, vertexParts, shaderBit.name);
    addBits(shaderBit.fragment, fragmentParts, shaderBit.name);
  });
  return {
    vertex: injectBits(vertex, vertexParts),
    fragment: injectBits(fragment, fragmentParts)
  };
}
const vertexGPUTemplate = (
  /* wgsl */
  `
    @in aPosition: vec2<f32>;
    @in aUV: vec2<f32>;

    @out @builtin(position) vPosition: vec4<f32>;
    @out vUV : vec2<f32>;
    @out vColor : vec4<f32>;

    {{header}}

    struct VSOutput {
        {{struct}}
    };

    @vertex
    fn main( {{in}} ) -> VSOutput {

        var worldTransformMatrix = globalUniforms.uWorldTransformMatrix;
        var modelMatrix = mat3x3<f32>(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        var position = aPosition;
        var uv = aUV;

        {{start}}
        
        vColor = vec4<f32>(1., 1., 1., 1.);

        {{main}}

        vUV = uv;

        var modelViewProjectionMatrix = globalUniforms.uProjectionMatrix * worldTransformMatrix * modelMatrix;

        vPosition =  vec4<f32>((modelViewProjectionMatrix *  vec3<f32>(position, 1.0)).xy, 0.0, 1.0);
       
        vColor *= globalUniforms.uWorldColorAlpha;

        {{end}}

        {{return}}
    };
`
);
const fragmentGPUTemplate = (
  /* wgsl */
  `
    @in vUV : vec2<f32>;
    @in vColor : vec4<f32>;
   
    {{header}}

    @fragment
    fn main(
        {{in}}
      ) -> @location(0) vec4<f32> {
        
        {{start}}

        var outColor:vec4<f32>;
      
        {{main}}
        
        var finalColor:vec4<f32> = outColor * vColor;

        {{end}}

        return finalColor;
      };
`
);
const vertexGlTemplate = (
  /* glsl */
  `
    in vec2 aPosition;
    in vec2 aUV;

    out vec4 vColor;
    out vec2 vUV;

    {{header}}

    void main(void){

        mat3 worldTransformMatrix = uWorldTransformMatrix;
        mat3 modelMatrix = mat3(
            1.0, 0.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 0.0, 1.0
          );
        vec2 position = aPosition;
        vec2 uv = aUV;
        
        {{start}}
        
        vColor = vec4(1.);
        
        {{main}}
        
        vUV = uv;
        
        mat3 modelViewProjectionMatrix = uProjectionMatrix * worldTransformMatrix * modelMatrix;

        gl_Position = vec4((modelViewProjectionMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);

        vColor *= uWorldColorAlpha;

        {{end}}
    }
`
);
const fragmentGlTemplate = (
  /* glsl */
  `
   
    in vec4 vColor;
    in vec2 vUV;

    out vec4 finalColor;

    {{header}}

    void main(void) {
        
        {{start}}

        vec4 outColor;
      
        {{main}}
        
        finalColor = outColor * vColor;
        
        {{end}}
    }
`
);
const globalUniformsBit = {
  name: "global-uniforms-bit",
  vertex: {
    header: (
      /* wgsl */
      `
        struct GlobalUniforms {
            uProjectionMatrix:mat3x3<f32>,
            uWorldTransformMatrix:mat3x3<f32>,
            uWorldColorAlpha: vec4<f32>,
            uResolution: vec2<f32>,
        }

        @group(0) @binding(0) var<uniform> globalUniforms : GlobalUniforms;
        `
    )
  }
};
const globalUniformsBitGl = {
  name: "global-uniforms-bit",
  vertex: {
    header: (
      /* glsl */
      `
          uniform mat3 uProjectionMatrix;
          uniform mat3 uWorldTransformMatrix;
          uniform vec4 uWorldColorAlpha;
          uniform vec2 uResolution;
        `
    )
  }
};
function compileHighShaderGpuProgram({ bits, name }) {
  const source = compileHighShader({
    template: {
      fragment: fragmentGPUTemplate,
      vertex: vertexGPUTemplate
    },
    bits: [
      globalUniformsBit,
      ...bits
    ]
  });
  return GpuProgram.from({
    name,
    vertex: {
      source: source.vertex,
      entryPoint: "main"
    },
    fragment: {
      source: source.fragment,
      entryPoint: "main"
    }
  });
}
function compileHighShaderGlProgram({ bits, name }) {
  return new GlProgram({
    name,
    ...compileHighShaderGl({
      template: {
        vertex: vertexGlTemplate,
        fragment: fragmentGlTemplate
      },
      bits: [
        globalUniformsBitGl,
        ...bits
      ]
    })
  });
}
const colorBit = {
  name: "color-bit",
  vertex: {
    header: (
      /* wgsl */
      `
            @in aColor: vec4<f32>;
        `
    ),
    main: (
      /* wgsl */
      `
            vColor *= vec4<f32>(aColor.rgb * aColor.a, aColor.a);
        `
    )
  }
};
const colorBitGl = {
  name: "color-bit",
  vertex: {
    header: (
      /* glsl */
      `
            in vec4 aColor;
        `
    ),
    main: (
      /* glsl */
      `
            vColor *= vec4(aColor.rgb * aColor.a, aColor.a);
        `
    )
  }
};
const textureBatchBitGpuCache = {};
function generateBindingSrc(maxTextures) {
  const src = [];
  if (maxTextures === 1) {
    src.push("@group(1) @binding(0) var textureSource1: texture_2d<f32>;");
    src.push("@group(1) @binding(1) var textureSampler1: sampler;");
  } else {
    let bindingIndex = 0;
    for (let i = 0; i < maxTextures; i++) {
      src.push(`@group(1) @binding(${bindingIndex++}) var textureSource${i + 1}: texture_2d<f32>;`);
      src.push(`@group(1) @binding(${bindingIndex++}) var textureSampler${i + 1}: sampler;`);
    }
  }
  return src.join("\n");
}
function generateSampleSrc(maxTextures) {
  const src = [];
  if (maxTextures === 1) {
    src.push("outColor = textureSampleGrad(textureSource1, textureSampler1, vUV, uvDx, uvDy);");
  } else {
    src.push("switch vTextureId {");
    for (let i = 0; i < maxTextures; i++) {
      if (i === maxTextures - 1) {
        src.push(`  default:{`);
      } else {
        src.push(`  case ${i}:{`);
      }
      src.push(`      outColor = textureSampleGrad(textureSource${i + 1}, textureSampler${i + 1}, vUV, uvDx, uvDy);`);
      src.push(`      break;}`);
    }
    src.push(`}`);
  }
  return src.join("\n");
}
function generateTextureBatchBit(maxTextures) {
  if (!textureBatchBitGpuCache[maxTextures]) {
    textureBatchBitGpuCache[maxTextures] = {
      name: "texture-batch-bit",
      vertex: {
        header: `
                @in aTextureIdAndRound: vec2<u32>;
                @out @interpolate(flat) vTextureId : u32;
            `,
        main: `
                vTextureId = aTextureIdAndRound.y;
            `,
        end: `
                if(aTextureIdAndRound.x == 1)
                {
                    vPosition = vec4<f32>(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
                }
            `
      },
      fragment: {
        header: `
                @in @interpolate(flat) vTextureId: u32;

                ${generateBindingSrc(maxTextures)}
            `,
        main: `
                var uvDx = dpdx(vUV);
                var uvDy = dpdy(vUV);

                ${generateSampleSrc(maxTextures)}
            `
      }
    };
  }
  return textureBatchBitGpuCache[maxTextures];
}
const textureBatchBitGlCache = {};
function generateSampleGlSrc(maxTextures) {
  const src = [];
  for (let i = 0; i < maxTextures; i++) {
    if (i > 0) {
      src.push("else");
    }
    if (i < maxTextures - 1) {
      src.push(`if(vTextureId < ${i}.5)`);
    }
    src.push("{");
    src.push(`	outColor = texture(uTextures[${i}], vUV);`);
    src.push("}");
  }
  return src.join("\n");
}
function generateTextureBatchBitGl(maxTextures) {
  if (!textureBatchBitGlCache[maxTextures]) {
    textureBatchBitGlCache[maxTextures] = {
      name: "texture-batch-bit",
      vertex: {
        header: `
                in vec2 aTextureIdAndRound;
                out float vTextureId;

            `,
        main: `
                vTextureId = aTextureIdAndRound.y;
            `,
        end: `
                if(aTextureIdAndRound.x == 1.)
                {
                    gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
                }
            `
      },
      fragment: {
        header: `
                in float vTextureId;

                uniform sampler2D uTextures[${maxTextures}];

            `,
        main: `

                ${generateSampleGlSrc(maxTextures)}
            `
      }
    };
  }
  return textureBatchBitGlCache[maxTextures];
}
const roundPixelsBit = {
  name: "round-pixels-bit",
  vertex: {
    header: (
      /* wgsl */
      `
            fn roundPixels(position: vec2<f32>, targetSize: vec2<f32>) -> vec2<f32> 
            {
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `
    )
  }
};
const roundPixelsBitGl = {
  name: "round-pixels-bit",
  vertex: {
    header: (
      /* glsl */
      `   
            vec2 roundPixels(vec2 position, vec2 targetSize)
            {       
                return (floor(((position * 0.5 + 0.5) * targetSize) + 0.5) / targetSize) * 2.0 - 1.0;
            }
        `
    )
  }
};
const batchSamplersUniformGroupHash = {};
function getBatchSamplersUniformGroup(maxTextures) {
  let batchSamplersUniformGroup = batchSamplersUniformGroupHash[maxTextures];
  if (batchSamplersUniformGroup)
    return batchSamplersUniformGroup;
  const sampleValues = new Int32Array(maxTextures);
  for (let i = 0; i < maxTextures; i++) {
    sampleValues[i] = i;
  }
  batchSamplersUniformGroup = batchSamplersUniformGroupHash[maxTextures] = new UniformGroup({
    uTextures: { value: sampleValues, type: `i32`, size: maxTextures }
  }, { isStatic: true });
  return batchSamplersUniformGroup;
}
class DefaultShader extends Shader {
  constructor(maxTextures) {
    const glProgram = compileHighShaderGlProgram({
      name: "batch",
      bits: [
        colorBitGl,
        generateTextureBatchBitGl(maxTextures),
        roundPixelsBitGl
      ]
    });
    const gpuProgram = compileHighShaderGpuProgram({
      name: "batch",
      bits: [
        colorBit,
        generateTextureBatchBit(maxTextures),
        roundPixelsBit
      ]
    });
    super({
      glProgram,
      gpuProgram,
      resources: {
        batchSamplers: getBatchSamplersUniformGroup(maxTextures)
      }
    });
  }
}
let defaultShader = null;
const _DefaultBatcher = class _DefaultBatcher2 extends Batcher {
  constructor() {
    super(...arguments);
    this.geometry = new BatchGeometry();
    this.shader = defaultShader || (defaultShader = new DefaultShader(this.maxTextures));
    this.name = _DefaultBatcher2.extension.name;
    this.vertexSize = 6;
  }
  /**
   * Packs the attributes of a DefaultBatchableMeshElement into the provided views.
   * @param element - The DefaultBatchableMeshElement to pack.
   * @param float32View - The Float32Array view to pack into.
   * @param uint32View - The Uint32Array view to pack into.
   * @param index - The starting index in the views.
   * @param textureId - The texture ID to use.
   */
  packAttributes(element, float32View, uint32View, index, textureId) {
    const textureIdAndRound = textureId << 16 | element.roundPixels & 65535;
    const wt = element.transform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const { positions, uvs } = element;
    const argb = element.color;
    const offset = element.attributeOffset;
    const end = offset + element.attributeSize;
    for (let i = offset; i < end; i++) {
      const i2 = i * 2;
      const x = positions[i2];
      const y = positions[i2 + 1];
      float32View[index++] = a * x + c * y + tx;
      float32View[index++] = d * y + b * x + ty;
      float32View[index++] = uvs[i2];
      float32View[index++] = uvs[i2 + 1];
      uint32View[index++] = argb;
      uint32View[index++] = textureIdAndRound;
    }
  }
  /**
   * Packs the attributes of a DefaultBatchableQuadElement into the provided views.
   * @param element - The DefaultBatchableQuadElement to pack.
   * @param float32View - The Float32Array view to pack into.
   * @param uint32View - The Uint32Array view to pack into.
   * @param index - The starting index in the views.
   * @param textureId - The texture ID to use.
   */
  packQuadAttributes(element, float32View, uint32View, index, textureId) {
    const texture = element.texture;
    const wt = element.transform;
    const a = wt.a;
    const b = wt.b;
    const c = wt.c;
    const d = wt.d;
    const tx = wt.tx;
    const ty = wt.ty;
    const bounds = element.bounds;
    const w0 = bounds.maxX;
    const w1 = bounds.minX;
    const h0 = bounds.maxY;
    const h1 = bounds.minY;
    const uvs = texture.uvs;
    const argb = element.color;
    const textureIdAndRound = textureId << 16 | element.roundPixels & 65535;
    float32View[index + 0] = a * w1 + c * h1 + tx;
    float32View[index + 1] = d * h1 + b * w1 + ty;
    float32View[index + 2] = uvs.x0;
    float32View[index + 3] = uvs.y0;
    uint32View[index + 4] = argb;
    uint32View[index + 5] = textureIdAndRound;
    float32View[index + 6] = a * w0 + c * h1 + tx;
    float32View[index + 7] = d * h1 + b * w0 + ty;
    float32View[index + 8] = uvs.x1;
    float32View[index + 9] = uvs.y1;
    uint32View[index + 10] = argb;
    uint32View[index + 11] = textureIdAndRound;
    float32View[index + 12] = a * w0 + c * h0 + tx;
    float32View[index + 13] = d * h0 + b * w0 + ty;
    float32View[index + 14] = uvs.x2;
    float32View[index + 15] = uvs.y2;
    uint32View[index + 16] = argb;
    uint32View[index + 17] = textureIdAndRound;
    float32View[index + 18] = a * w1 + c * h0 + tx;
    float32View[index + 19] = d * h0 + b * w1 + ty;
    float32View[index + 20] = uvs.x3;
    float32View[index + 21] = uvs.y3;
    uint32View[index + 22] = argb;
    uint32View[index + 23] = textureIdAndRound;
  }
};
_DefaultBatcher.extension = {
  type: [
    ExtensionType.Batcher
  ],
  name: "default"
};
let DefaultBatcher = _DefaultBatcher;
const localUniformBit = {
  name: "local-uniform-bit",
  vertex: {
    header: (
      /* wgsl */
      `

            struct LocalUniforms {
                uTransformMatrix:mat3x3<f32>,
                uColor:vec4<f32>,
                uRound:f32,
            }

            @group(1) @binding(0) var<uniform> localUniforms : LocalUniforms;
        `
    ),
    main: (
      /* wgsl */
      `
            vColor *= localUniforms.uColor;
            modelMatrix *= localUniforms.uTransformMatrix;
        `
    ),
    end: (
      /* wgsl */
      `
            if(localUniforms.uRound == 1)
            {
                vPosition = vec4(roundPixels(vPosition.xy, globalUniforms.uResolution), vPosition.zw);
            }
        `
    )
  }
};
const localUniformBitGroup2 = {
  ...localUniformBit,
  vertex: {
    ...localUniformBit.vertex,
    // replace the group!
    header: localUniformBit.vertex.header.replace("group(1)", "group(2)")
  }
};
const localUniformBitGl = {
  name: "local-uniform-bit",
  vertex: {
    header: (
      /* glsl */
      `

            uniform mat3 uTransformMatrix;
            uniform vec4 uColor;
            uniform float uRound;
        `
    ),
    main: (
      /* glsl */
      `
            vColor *= uColor;
            modelMatrix = uTransformMatrix;
        `
    ),
    end: (
      /* glsl */
      `
            if(uRound == 1.)
            {
                gl_Position.xy = roundPixels(gl_Position.xy, uResolution);
            }
        `
    )
  }
};
class BatchableSprite {
  constructor() {
    this.batcherName = "default";
    this.topology = "triangle-list";
    this.attributeSize = 4;
    this.indexSize = 6;
    this.packAsQuad = true;
    this.roundPixels = 0;
    this._attributeStart = 0;
    this._batcher = null;
    this._batch = null;
  }
  get blendMode() {
    return this.renderable.groupBlendMode;
  }
  get color() {
    return this.renderable.groupColorAlpha;
  }
  reset() {
    this.renderable = null;
    this.texture = null;
    this._batcher = null;
    this._batch = null;
    this.bounds = null;
  }
}
function color32BitToUniform(abgr, out, offset) {
  const alpha = (abgr >> 24 & 255) / 255;
  out[offset++] = (abgr & 255) / 255 * alpha;
  out[offset++] = (abgr >> 8 & 255) / 255 * alpha;
  out[offset++] = (abgr >> 16 & 255) / 255 * alpha;
  out[offset++] = alpha;
}
export {
  BindGroup as B,
  DefaultBatcher as D,
  Geometry as G,
  RendererType as R,
  State as S,
  UniformGroup as U,
  ViewableBuffer as V,
  Buffer as a,
  BufferUsage as b,
  color32BitToUniform as c,
  getAttributeInfoFromFormat as d,
  Shader as e,
  GlProgram as f,
  getAdjustedBlendModeBlend as g,
  GpuProgram as h,
  compileHighShaderGpuProgram as i,
  compileHighShaderGlProgram as j,
  localUniformBitGl as k,
  localUniformBit as l,
  roundPixelsBitGl as m,
  getMaxTexturesPerBatch as n,
  colorBit as o,
  generateTextureBatchBit as p,
  colorBitGl as q,
  roundPixelsBit as r,
  generateTextureBatchBitGl as s,
  getBatchSamplersUniformGroup as t,
  BatchableSprite as u,
  fastCopy as v,
  STENCIL_MODES as w,
  createIdFromString as x,
  localUniformBitGroup2 as y
};
