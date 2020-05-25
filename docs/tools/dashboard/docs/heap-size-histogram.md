### Heap Size Breakdown

Heap Size Breakdown component of GraalVM Dashboard presents a visual summary of
the sizes of the preallocated objects of different classes, which were included
into a native image heap. The preallocated objects are objects
allocated in advance during a native image generation, stored to a separate
section, and directly loaded into memory. This contributes to the size overall
size of an image.

You can use Heap Size Breakdown to boil down to different objects. In case of
the `Hello` example, Heap Size Breakdown may not be very helpful as most of the
objects in the heap are internal to Native Image pulls. We do not have any
preallocated objects that belong to the `Hello` example.

<img src="/docs/tools/dashboard/resources/img/heap-size-breakdown.png" alt="heap-size" width="800" height="500"/>
