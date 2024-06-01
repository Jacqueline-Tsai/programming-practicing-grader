// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
// This module ports:
// - https://github.com/nodejs/node/blob/master/src/node_file-inl.h
// - https://github.com/nodejs/node/blob/master/src/node_file.cc
// - https://github.com/nodejs/node/blob/master/src/node_file.h
import { assert } from "../../testing/asserts.ts";
/**
 * Write to the given file from the given buffer synchronously.
 *
 * Implements sync part of WriteBuffer in src/node_file.cc
 * See: https://github.com/nodejs/node/blob/e9ed113/src/node_file.cc#L1818
 *
 * @param fs file descriptor
 * @param buffer the data to write
 * @param offset where in the buffer to start from
 * @param length how much to write
 * @param position if integer, position to write at in the file. if null, write from the current position
 * @param context context object for passing error number
 */ export function writeBuffer(fd, buffer, offset, length, position, ctx) {
  assert(offset >= 0, "offset should be greater or equal to 0");
  assert(offset + length <= buffer.byteLength, `buffer doesn't have enough data: byteLength = ${buffer.byteLength}, offset + length = ${offset + length}`);
  if (position) {
    Deno.seekSync(fd, position, Deno.SeekMode.Current);
  }
  const subarray = buffer.subarray(offset, offset + length);
  try {
    return Deno.writeSync(fd, subarray);
  } catch (e) {
    ctx.errno = extractOsErrorNumberFromErrorMessage(e);
    return 0;
  }
}
function extractOsErrorNumberFromErrorMessage(e) {
  const match = e instanceof Error ? e.message.match(/\(os error (\d+)\)/) : false;
  if (match) {
    return +match[1];
  }
  return 255; // Unknown error
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvaW50ZXJuYWxfYmluZGluZy9ub2RlX2ZpbGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4vLyBUaGlzIG1vZHVsZSBwb3J0czpcbi8vIC0gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL3NyYy9ub2RlX2ZpbGUtaW5sLmhcbi8vIC0gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL3NyYy9ub2RlX2ZpbGUuY2Ncbi8vIC0gaHR0cHM6Ly9naXRodWIuY29tL25vZGVqcy9ub2RlL2Jsb2IvbWFzdGVyL3NyYy9ub2RlX2ZpbGUuaFxuXG5pbXBvcnQgeyBhc3NlcnQgfSBmcm9tIFwiLi4vLi4vdGVzdGluZy9hc3NlcnRzLnRzXCI7XG5cbi8qKlxuICogV3JpdGUgdG8gdGhlIGdpdmVuIGZpbGUgZnJvbSB0aGUgZ2l2ZW4gYnVmZmVyIHN5bmNocm9ub3VzbHkuXG4gKlxuICogSW1wbGVtZW50cyBzeW5jIHBhcnQgb2YgV3JpdGVCdWZmZXIgaW4gc3JjL25vZGVfZmlsZS5jY1xuICogU2VlOiBodHRwczovL2dpdGh1Yi5jb20vbm9kZWpzL25vZGUvYmxvYi9lOWVkMTEzL3NyYy9ub2RlX2ZpbGUuY2MjTDE4MThcbiAqXG4gKiBAcGFyYW0gZnMgZmlsZSBkZXNjcmlwdG9yXG4gKiBAcGFyYW0gYnVmZmVyIHRoZSBkYXRhIHRvIHdyaXRlXG4gKiBAcGFyYW0gb2Zmc2V0IHdoZXJlIGluIHRoZSBidWZmZXIgdG8gc3RhcnQgZnJvbVxuICogQHBhcmFtIGxlbmd0aCBob3cgbXVjaCB0byB3cml0ZVxuICogQHBhcmFtIHBvc2l0aW9uIGlmIGludGVnZXIsIHBvc2l0aW9uIHRvIHdyaXRlIGF0IGluIHRoZSBmaWxlLiBpZiBudWxsLCB3cml0ZSBmcm9tIHRoZSBjdXJyZW50IHBvc2l0aW9uXG4gKiBAcGFyYW0gY29udGV4dCBjb250ZXh0IG9iamVjdCBmb3IgcGFzc2luZyBlcnJvciBudW1iZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdyaXRlQnVmZmVyKFxuICBmZDogbnVtYmVyLFxuICBidWZmZXI6IFVpbnQ4QXJyYXksXG4gIG9mZnNldDogbnVtYmVyLFxuICBsZW5ndGg6IG51bWJlcixcbiAgcG9zaXRpb246IG51bWJlciB8IG51bGwsXG4gIGN0eDogeyBlcnJubz86IG51bWJlciB9LFxuKSB7XG4gIGFzc2VydChvZmZzZXQgPj0gMCwgXCJvZmZzZXQgc2hvdWxkIGJlIGdyZWF0ZXIgb3IgZXF1YWwgdG8gMFwiKTtcbiAgYXNzZXJ0KFxuICAgIG9mZnNldCArIGxlbmd0aCA8PSBidWZmZXIuYnl0ZUxlbmd0aCxcbiAgICBgYnVmZmVyIGRvZXNuJ3QgaGF2ZSBlbm91Z2ggZGF0YTogYnl0ZUxlbmd0aCA9ICR7YnVmZmVyLmJ5dGVMZW5ndGh9LCBvZmZzZXQgKyBsZW5ndGggPSAke1xuICAgICAgb2Zmc2V0ICtcbiAgICAgIGxlbmd0aFxuICAgIH1gLFxuICApO1xuXG4gIGlmIChwb3NpdGlvbikge1xuICAgIERlbm8uc2Vla1N5bmMoZmQsIHBvc2l0aW9uLCBEZW5vLlNlZWtNb2RlLkN1cnJlbnQpO1xuICB9XG5cbiAgY29uc3Qgc3ViYXJyYXkgPSBidWZmZXIuc3ViYXJyYXkob2Zmc2V0LCBvZmZzZXQgKyBsZW5ndGgpO1xuXG4gIHRyeSB7XG4gICAgcmV0dXJuIERlbm8ud3JpdGVTeW5jKGZkLCBzdWJhcnJheSk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBjdHguZXJybm8gPSBleHRyYWN0T3NFcnJvck51bWJlckZyb21FcnJvck1lc3NhZ2UoZSk7XG4gICAgcmV0dXJuIDA7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdE9zRXJyb3JOdW1iZXJGcm9tRXJyb3JNZXNzYWdlKGU6IHVua25vd24pOiBudW1iZXIge1xuICBjb25zdCBtYXRjaCA9IGUgaW5zdGFuY2VvZiBFcnJvclxuICAgID8gZS5tZXNzYWdlLm1hdGNoKC9cXChvcyBlcnJvciAoXFxkKylcXCkvKVxuICAgIDogZmFsc2U7XG5cbiAgaWYgKG1hdGNoKSB7XG4gICAgcmV0dXJuICttYXRjaFsxXTtcbiAgfVxuXG4gIHJldHVybiAyNTU7IC8vIFVua25vd24gZXJyb3Jcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsc0RBQXNEO0FBQ3RELEVBQUU7QUFDRiwwRUFBMEU7QUFDMUUsZ0VBQWdFO0FBQ2hFLHNFQUFzRTtBQUN0RSxzRUFBc0U7QUFDdEUsNEVBQTRFO0FBQzVFLHFFQUFxRTtBQUNyRSx3QkFBd0I7QUFDeEIsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSx5REFBeUQ7QUFDekQsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSw2REFBNkQ7QUFDN0QsNEVBQTRFO0FBQzVFLDJFQUEyRTtBQUMzRSx3RUFBd0U7QUFDeEUsNEVBQTRFO0FBQzVFLHlDQUF5QztBQUV6QyxxQkFBcUI7QUFDckIsbUVBQW1FO0FBQ25FLGdFQUFnRTtBQUNoRSwrREFBK0Q7QUFFL0QsU0FBUyxNQUFNLFFBQVEsMkJBQTJCO0FBRWxEOzs7Ozs7Ozs7Ozs7Q0FZQyxHQUNELE9BQU8sU0FBUyxZQUNkLEVBQVUsRUFDVixNQUFrQixFQUNsQixNQUFjLEVBQ2QsTUFBYyxFQUNkLFFBQXVCLEVBQ3ZCLEdBQXVCO0VBRXZCLE9BQU8sVUFBVSxHQUFHO0VBQ3BCLE9BQ0UsU0FBUyxVQUFVLE9BQU8sVUFBVSxFQUNwQyxDQUFDLDhDQUE4QyxFQUFFLE9BQU8sVUFBVSxDQUFDLG9CQUFvQixFQUNyRixTQUNBLE9BQ0QsQ0FBQztFQUdKLElBQUksVUFBVTtJQUNaLEtBQUssUUFBUSxDQUFDLElBQUksVUFBVSxLQUFLLFFBQVEsQ0FBQyxPQUFPO0VBQ25EO0VBRUEsTUFBTSxXQUFXLE9BQU8sUUFBUSxDQUFDLFFBQVEsU0FBUztFQUVsRCxJQUFJO0lBQ0YsT0FBTyxLQUFLLFNBQVMsQ0FBQyxJQUFJO0VBQzVCLEVBQUUsT0FBTyxHQUFHO0lBQ1YsSUFBSSxLQUFLLEdBQUcscUNBQXFDO0lBQ2pELE9BQU87RUFDVDtBQUNGO0FBRUEsU0FBUyxxQ0FBcUMsQ0FBVTtFQUN0RCxNQUFNLFFBQVEsYUFBYSxRQUN2QixFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsd0JBQ2hCO0VBRUosSUFBSSxPQUFPO0lBQ1QsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO0VBQ2xCO0VBRUEsT0FBTyxLQUFLLGdCQUFnQjtBQUM5QiJ9