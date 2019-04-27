
export var gl: WebGL2RenderingContext;
export function setGL(_gl: WebGL2RenderingContext) {
  gl = _gl;
}


export function readTextFile(file: string): string
{
  var text = "";
  var rawFile = new XMLHttpRequest();
  rawFile.open("GET", file, false);
  rawFile.onreadystatechange = function ()
  {
    if(rawFile.readyState === 4)
    {
      if(rawFile.status === 200 || rawFile.status == 0)
      {
        var allText = rawFile.responseText;
        text = allText;
      }
    }
  }
  rawFile.send(null);
  return text;

}

export const VBO = (function() {
  const visible = {
    createFromArray: function (gl: any, array: any [], size: number, type: any) {
      const VBO = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, VBO);
      gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, null);

      return {data: VBO, size: size, type: type};
    },

    createQuad: function (gl: any, minX: number, minY: number, maxX: number, maxY: number): any {
      let vert = [
        minX, minY,
        maxX, minY,
        minX, maxY,
        maxX, maxY];

      return this.createFromArray(gl, new Float32Array(vert), 2, gl.FLOAT);
    }
  };
  return Object.freeze(visible);
})();

export const FBO = (function() {
  const visible = {
    create: function(gl:any, width:number, height:number) {
      const FBO = gl.createFramebuffer();
      FBO.width = width;
      FBO.height = height;

      FBO.bind = function(gl:any, color:any, depth:number=null) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this);
        gl.viewport(0, 0, this.width, this.height);

        gl.framebufferTexture2D(
            gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color, 0);

        if (depth !== null) {
          gl.bindRenderbuffer(gl.RENDERBUFFER, depth);
          gl.framebufferRenderbuffer(
              gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depth);
        }
      };

      return FBO;
    },

    bindDefault: function(gl:any) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }
  };

  return Object.freeze(visible);
})();

