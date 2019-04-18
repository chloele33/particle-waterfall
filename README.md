# Waterfall - Particle Simulation

### Chloe Le (chloele)
- https://chloele.com/

### Demo: 
- not yet available 





## References
Particle animation is based on the paper [Particle Animation and Rendering Using Data Parallel Computation](https://www.karlsims.com/papers/ParticlesSiggraph90.pdf). 


## Inspiration
This project is based on the paper [Particle Animation and Rendering Using Data Parallel Computation](https://www.karlsims.com/papers/ParticlesSiggraph90.pdf). 
It is especially inspired by the waterfall simulation mentioned in the paper's result seciont


## Features Implemented
- Transform Feedback 
- Instanced Rendering
- Particle animation with simulated physics 

## Implementation
 
### Transform Feedback (In progress)
I set up the ParticleCollection class with WebGLTransformFeedback. In creating the particle collection, I bind arrays for time, colors, velocity, and position. I am also calling gl.bindTransformFeedback at the end of setting the VBOs. 

### Particle Animation (In progress)
I created the Particle class that stores the size, velocity, position, and acceleration of the particle. The update function first updates the position, then updates the velocity. 
