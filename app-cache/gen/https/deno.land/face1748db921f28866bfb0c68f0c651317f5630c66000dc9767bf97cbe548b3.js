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
import * as DenoUnstable from "../_deno_unstable.ts";
import { notImplemented } from "./_utils.ts";
import { validateIntegerRange } from "./_utils.ts";
import { EOL as fsEOL } from "../fs/eol.ts";
import process from "./process.ts";
import { isWindows, osType } from "../_util/os.ts";
const SEE_GITHUB_ISSUE = "See https://github.com/denoland/deno_std/issues/1436";
export function arch() {
    return process.arch;
}
// deno-lint-ignore no-explicit-any
arch[Symbol.toPrimitive] = ()=>process.arch;
// deno-lint-ignore no-explicit-any
endianness[Symbol.toPrimitive] = ()=>endianness();
// deno-lint-ignore no-explicit-any
freemem[Symbol.toPrimitive] = ()=>freemem();
// deno-lint-ignore no-explicit-any
homedir[Symbol.toPrimitive] = ()=>homedir();
// deno-lint-ignore no-explicit-any
hostname[Symbol.toPrimitive] = ()=>hostname();
// deno-lint-ignore no-explicit-any
platform[Symbol.toPrimitive] = ()=>platform();
// deno-lint-ignore no-explicit-any
release[Symbol.toPrimitive] = ()=>release();
// deno-lint-ignore no-explicit-any
totalmem[Symbol.toPrimitive] = ()=>totalmem();
// deno-lint-ignore no-explicit-any
type[Symbol.toPrimitive] = ()=>type();
// deno-lint-ignore no-explicit-any
uptime[Symbol.toPrimitive] = ()=>uptime();
export function cpus() {
    return Array.from(Array(navigator.hardwareConcurrency)).map(()=>{
        return {
            model: "",
            speed: 0,
            times: {
                user: 0,
                nice: 0,
                sys: 0,
                idle: 0,
                irq: 0
            }
        };
    });
}
/**
 * Returns a string identifying the endianness of the CPU for which the Deno
 * binary was compiled. Possible values are 'BE' for big endian and 'LE' for
 * little endian.
 */ export function endianness() {
    // Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/DataView#Endianness
    const buffer = new ArrayBuffer(2);
    new DataView(buffer).setInt16(0, 256, true);
    // Int16Array uses the platform's endianness.
    return new Int16Array(buffer)[0] === 256 ? "LE" : "BE";
}
/** Return free memory amount */ export function freemem() {
    return DenoUnstable.systemMemoryInfo().free;
}
/** Not yet implemented */ export function getPriority(pid = 0) {
    validateIntegerRange(pid, "pid");
    notImplemented(SEE_GITHUB_ISSUE);
}
/** Returns the string path of the current user's home directory. */ export function homedir() {
    // Note: Node/libuv calls getpwuid() / GetUserProfileDirectory() when the
    // environment variable isn't set but that's the (very uncommon) fallback
    // path. IMO, it's okay to punt on that for now.
    switch(osType){
        case "windows":
            return Deno.env.get("USERPROFILE") || null;
        case "linux":
        case "darwin":
            return Deno.env.get("HOME") || null;
        default:
            throw Error("unreachable");
    }
}
/** Returns the host name of the operating system as a string. */ export function hostname() {
    return DenoUnstable.hostname();
}
/** Returns an array containing the 1, 5, and 15 minute load averages */ export function loadavg() {
    if (isWindows) {
        return [
            0,
            0,
            0
        ];
    }
    return DenoUnstable.loadavg();
}
/** Returns an object containing network interfaces that have been assigned a network address.
 * Each key on the returned object identifies a network interface. The associated value is an array of objects that each describe an assigned network address. */ export function networkInterfaces() {
    const interfaces = {};
    for (const { name , address , netmask , family , mac , scopeid , cidr  } of DenoUnstable.networkInterfaces()){
        const addresses = interfaces[name] ||= [];
        const networkAddress = {
            address,
            netmask,
            family,
            mac,
            internal: family === "IPv4" && isIPv4LoopbackAddr(address) || family === "IPv6" && isIPv6LoopbackAddr(address),
            cidr
        };
        if (family === "IPv6") {
            networkAddress.scopeid = scopeid;
        }
        addresses.push(networkAddress);
    }
    return interfaces;
}
function isIPv4LoopbackAddr(addr) {
    return addr.startsWith("127");
}
function isIPv6LoopbackAddr(addr) {
    return addr === "::1" || addr === "fe80::1";
}
/** Returns the a string identifying the operating system platform. The value is set at compile time. Possible values are 'darwin', 'linux', and 'win32'. */ export function platform() {
    return process.platform;
}
/** Returns the operating system as a string */ export function release() {
    return DenoUnstable.osRelease();
}
/** Not yet implemented */ export function setPriority(pid, priority) {
    /* The node API has the 'pid' as the first parameter and as optional.
       This makes for a problematic implementation in Typescript. */ if (priority === undefined) {
        priority = pid;
        pid = 0;
    }
    validateIntegerRange(pid, "pid");
    validateIntegerRange(priority, "priority", -20, 19);
    notImplemented(SEE_GITHUB_ISSUE);
}
/** Returns the operating system's default directory for temporary files as a string. */ export function tmpdir() {
    /* This follows the node js implementation, but has a few
     differences:
     * On windows, if none of the environment variables are defined,
       we return null.
     * On unix we use a plain Deno.env.get, instead of safeGetenv,
       which special cases setuid binaries.
     * Node removes a single trailing / or \, we remove all.
  */ if (isWindows) {
        const temp = Deno.env.get("TEMP") || Deno.env.get("TMP");
        if (temp) {
            return temp.replace(/(?<!:)[/\\]*$/, "");
        }
        const base = Deno.env.get("SYSTEMROOT") || Deno.env.get("WINDIR");
        if (base) {
            return base + "\\temp";
        }
        return null;
    } else {
        const temp = Deno.env.get("TMPDIR") || Deno.env.get("TMP") || Deno.env.get("TEMP") || "/tmp";
        return temp.replace(/(?<!^)\/*$/, "");
    }
}
/** Return total physical memory amount */ export function totalmem() {
    return DenoUnstable.systemMemoryInfo().total;
}
/** Returns operating system type (i.e. 'Windows_NT', 'Linux', 'Darwin') */ export function type() {
    switch(Deno.build.os){
        case "windows":
            return "Windows_NT";
        case "linux":
            return "Linux";
        case "darwin":
            return "Darwin";
        default:
            throw Error("unreachable");
    }
}
/** Not yet implemented */ export function uptime() {
    notImplemented(SEE_GITHUB_ISSUE);
}
/** Not yet implemented */ export function userInfo(// deno-lint-ignore no-unused-vars
options = {
    encoding: "utf-8"
}) {
    notImplemented(SEE_GITHUB_ISSUE);
}
export const constants = {
    // UV_UDP_REUSEADDR: 4,  //see https://nodejs.org/docs/latest-v12.x/api/os.html#os_libuv_constants
    dlopen: {
    },
    errno: {
    },
    // Needs to be kept in sync with `Deno.Signal` type.
    signals: {
        "SIGABRT": "SIGABRT",
        "SIGALRM": "SIGALRM",
        "SIGBUS": "SIGBUS",
        "SIGCHLD": "SIGCHLD",
        "SIGCONT": "SIGCONT",
        "SIGEMT": "SIGEMT",
        "SIGFPE": "SIGFPE",
        "SIGHUP": "SIGHUP",
        "SIGILL": "SIGILL",
        "SIGINFO": "SIGINFO",
        "SIGINT": "SIGINT",
        "SIGIO": "SIGIO",
        "SIGKILL": "SIGKILL",
        "SIGPIPE": "SIGPIPE",
        "SIGPROF": "SIGPROF",
        "SIGPWR": "SIGPWR",
        "SIGQUIT": "SIGQUIT",
        "SIGSEGV": "SIGSEGV",
        "SIGSTKFLT": "SIGSTKFLT",
        "SIGSTOP": "SIGSTOP",
        "SIGSYS": "SIGSYS",
        "SIGTERM": "SIGTERM",
        "SIGTRAP": "SIGTRAP",
        "SIGTSTP": "SIGTSTP",
        "SIGTTIN": "SIGTTIN",
        "SIGTTOU": "SIGTTOU",
        "SIGURG": "SIGURG",
        "SIGUSR1": "SIGUSR1",
        "SIGUSR2": "SIGUSR2",
        "SIGVTALRM": "SIGVTALRM",
        "SIGWINCH": "SIGWINCH",
        "SIGXCPU": "SIGXCPU",
        "SIGXFSZ": "SIGXFSZ"
    },
    priority: {
    }
};
export const EOL = isWindows ? fsEOL.CRLF : fsEOL.LF;
export const devNull = isWindows ? "\\\\.\\nul" : "/dev/null";
export default {
    arch,
    cpus,
    endianness,
    freemem,
    getPriority,
    homedir,
    hostname,
    loadavg,
    networkInterfaces,
    platform,
    release,
    setPriority,
    tmpdir,
    totalmem,
    type,
    uptime,
    userInfo,
    constants,
    EOL,
    devNull
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjEzMi4wL25vZGUvb3MudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMiB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuaW1wb3J0ICogYXMgRGVub1Vuc3RhYmxlIGZyb20gXCIuLi9fZGVub191bnN0YWJsZS50c1wiO1xuaW1wb3J0IHsgbm90SW1wbGVtZW50ZWQgfSBmcm9tIFwiLi9fdXRpbHMudHNcIjtcbmltcG9ydCB7IHZhbGlkYXRlSW50ZWdlclJhbmdlIH0gZnJvbSBcIi4vX3V0aWxzLnRzXCI7XG5pbXBvcnQgeyBFT0wgYXMgZnNFT0wgfSBmcm9tIFwiLi4vZnMvZW9sLnRzXCI7XG5pbXBvcnQgcHJvY2VzcyBmcm9tIFwiLi9wcm9jZXNzLnRzXCI7XG5pbXBvcnQgeyBpc1dpbmRvd3MsIG9zVHlwZSB9IGZyb20gXCIuLi9fdXRpbC9vcy50c1wiO1xuXG5jb25zdCBTRUVfR0lUSFVCX0lTU1VFID0gXCJTZWUgaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL2lzc3Vlcy8xNDM2XCI7XG5cbmludGVyZmFjZSBDUFVUaW1lcyB7XG4gIC8qKiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGUgQ1BVIGhhcyBzcGVudCBpbiB1c2VyIG1vZGUgKi9cbiAgdXNlcjogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGUgQ1BVIGhhcyBzcGVudCBpbiBuaWNlIG1vZGUgKi9cbiAgbmljZTogbnVtYmVyO1xuXG4gIC8qKiBUaGUgbnVtYmVyIG9mIG1pbGxpc2Vjb25kcyB0aGUgQ1BVIGhhcyBzcGVudCBpbiBzeXMgbW9kZSAqL1xuICBzeXM6IG51bWJlcjtcblxuICAvKiogVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhlIENQVSBoYXMgc3BlbnQgaW4gaWRsZSBtb2RlICovXG4gIGlkbGU6IG51bWJlcjtcblxuICAvKiogVGhlIG51bWJlciBvZiBtaWxsaXNlY29uZHMgdGhlIENQVSBoYXMgc3BlbnQgaW4gaXJxIG1vZGUgKi9cbiAgaXJxOiBudW1iZXI7XG59XG5cbmludGVyZmFjZSBDUFVDb3JlSW5mbyB7XG4gIG1vZGVsOiBzdHJpbmc7XG5cbiAgLyoqIGluIE1IeiAqL1xuICBzcGVlZDogbnVtYmVyO1xuXG4gIHRpbWVzOiBDUFVUaW1lcztcbn1cblxuaW50ZXJmYWNlIE5ldHdvcmtBZGRyZXNzIHtcbiAgLyoqIFRoZSBhc3NpZ25lZCBJUHY0IG9yIElQdjYgYWRkcmVzcyAqL1xuICBhZGRyZXNzOiBzdHJpbmc7XG5cbiAgLyoqIFRoZSBJUHY0IG9yIElQdjYgbmV0d29yayBtYXNrICovXG4gIG5ldG1hc2s6IHN0cmluZztcblxuICBmYW1pbHk6IFwiSVB2NFwiIHwgXCJJUHY2XCI7XG5cbiAgLyoqIFRoZSBNQUMgYWRkcmVzcyBvZiB0aGUgbmV0d29yayBpbnRlcmZhY2UgKi9cbiAgbWFjOiBzdHJpbmc7XG5cbiAgLyoqIHRydWUgaWYgdGhlIG5ldHdvcmsgaW50ZXJmYWNlIGlzIGEgbG9vcGJhY2sgb3Igc2ltaWxhciBpbnRlcmZhY2UgdGhhdCBpcyBub3QgcmVtb3RlbHkgYWNjZXNzaWJsZTsgb3RoZXJ3aXNlIGZhbHNlICovXG4gIGludGVybmFsOiBib29sZWFuO1xuXG4gIC8qKiBUaGUgbnVtZXJpYyBJUHY2IHNjb3BlIElEIChvbmx5IHNwZWNpZmllZCB3aGVuIGZhbWlseSBpcyBJUHY2KSAqL1xuICBzY29wZWlkPzogbnVtYmVyO1xuXG4gIC8qKiBUaGUgYXNzaWduZWQgSVB2NCBvciBJUHY2IGFkZHJlc3Mgd2l0aCB0aGUgcm91dGluZyBwcmVmaXggaW4gQ0lEUiBub3RhdGlvbi4gSWYgdGhlIG5ldG1hc2sgaXMgaW52YWxpZCwgdGhpcyBwcm9wZXJ0eSBpcyBzZXQgdG8gbnVsbC4gKi9cbiAgY2lkcjogc3RyaW5nO1xufVxuXG5pbnRlcmZhY2UgTmV0d29ya0ludGVyZmFjZXMge1xuICBba2V5OiBzdHJpbmddOiBOZXR3b3JrQWRkcmVzc1tdO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFVzZXJJbmZvT3B0aW9ucyB7XG4gIGVuY29kaW5nOiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBVc2VySW5mbyB7XG4gIHVzZXJuYW1lOiBzdHJpbmc7XG4gIHVpZDogbnVtYmVyO1xuICBnaWQ6IG51bWJlcjtcbiAgc2hlbGw6IHN0cmluZztcbiAgaG9tZWRpcjogc3RyaW5nO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJjaCgpOiBzdHJpbmcge1xuICByZXR1cm4gcHJvY2Vzcy5hcmNoO1xufVxuXG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuKGFyY2ggYXMgYW55KVtTeW1ib2wudG9QcmltaXRpdmVdID0gKCk6IHN0cmluZyA9PiBwcm9jZXNzLmFyY2g7XG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuKGVuZGlhbm5lc3MgYXMgYW55KVtTeW1ib2wudG9QcmltaXRpdmVdID0gKCk6IHN0cmluZyA9PiBlbmRpYW5uZXNzKCk7XG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuKGZyZWVtZW0gYXMgYW55KVtTeW1ib2wudG9QcmltaXRpdmVdID0gKCk6IG51bWJlciA9PiBmcmVlbWVtKCk7XG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuKGhvbWVkaXIgYXMgYW55KVtTeW1ib2wudG9QcmltaXRpdmVdID0gKCk6IHN0cmluZyB8IG51bGwgPT4gaG9tZWRpcigpO1xuLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbihob3N0bmFtZSBhcyBhbnkpW1N5bWJvbC50b1ByaW1pdGl2ZV0gPSAoKTogc3RyaW5nIHwgbnVsbCA9PiBob3N0bmFtZSgpO1xuLy8gZGVuby1saW50LWlnbm9yZSBuby1leHBsaWNpdC1hbnlcbihwbGF0Zm9ybSBhcyBhbnkpW1N5bWJvbC50b1ByaW1pdGl2ZV0gPSAoKTogc3RyaW5nID0+IHBsYXRmb3JtKCk7XG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuKHJlbGVhc2UgYXMgYW55KVtTeW1ib2wudG9QcmltaXRpdmVdID0gKCk6IHN0cmluZyA9PiByZWxlYXNlKCk7XG4vLyBkZW5vLWxpbnQtaWdub3JlIG5vLWV4cGxpY2l0LWFueVxuKHRvdGFsbWVtIGFzIGFueSlbU3ltYm9sLnRvUHJpbWl0aXZlXSA9ICgpOiBudW1iZXIgPT4gdG90YWxtZW0oKTtcbi8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4odHlwZSBhcyBhbnkpW1N5bWJvbC50b1ByaW1pdGl2ZV0gPSAoKTogc3RyaW5nID0+IHR5cGUoKTtcbi8vIGRlbm8tbGludC1pZ25vcmUgbm8tZXhwbGljaXQtYW55XG4odXB0aW1lIGFzIGFueSlbU3ltYm9sLnRvUHJpbWl0aXZlXSA9ICgpOiBudW1iZXIgPT4gdXB0aW1lKCk7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcHVzKCk6IENQVUNvcmVJbmZvW10ge1xuICByZXR1cm4gQXJyYXkuZnJvbShBcnJheShuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeSkpLm1hcCgoKSA9PiB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG1vZGVsOiBcIlwiLFxuICAgICAgc3BlZWQ6IDAsXG4gICAgICB0aW1lczoge1xuICAgICAgICB1c2VyOiAwLFxuICAgICAgICBuaWNlOiAwLFxuICAgICAgICBzeXM6IDAsXG4gICAgICAgIGlkbGU6IDAsXG4gICAgICAgIGlycTogMCxcbiAgICAgIH0sXG4gICAgfTtcbiAgfSk7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyBpZGVudGlmeWluZyB0aGUgZW5kaWFubmVzcyBvZiB0aGUgQ1BVIGZvciB3aGljaCB0aGUgRGVub1xuICogYmluYXJ5IHdhcyBjb21waWxlZC4gUG9zc2libGUgdmFsdWVzIGFyZSAnQkUnIGZvciBiaWcgZW5kaWFuIGFuZCAnTEUnIGZvclxuICogbGl0dGxlIGVuZGlhbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVuZGlhbm5lc3MoKTogXCJCRVwiIHwgXCJMRVwiIHtcbiAgLy8gU291cmNlOiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9EYXRhVmlldyNFbmRpYW5uZXNzXG4gIGNvbnN0IGJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcigyKTtcbiAgbmV3IERhdGFWaWV3KGJ1ZmZlcikuc2V0SW50MTYoMCwgMjU2LCB0cnVlIC8qIGxpdHRsZUVuZGlhbiAqLyk7XG4gIC8vIEludDE2QXJyYXkgdXNlcyB0aGUgcGxhdGZvcm0ncyBlbmRpYW5uZXNzLlxuICByZXR1cm4gbmV3IEludDE2QXJyYXkoYnVmZmVyKVswXSA9PT0gMjU2ID8gXCJMRVwiIDogXCJCRVwiO1xufVxuXG4vKiogUmV0dXJuIGZyZWUgbWVtb3J5IGFtb3VudCAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyZWVtZW0oKTogbnVtYmVyIHtcbiAgcmV0dXJuIERlbm9VbnN0YWJsZS5zeXN0ZW1NZW1vcnlJbmZvKCkuZnJlZTtcbn1cblxuLyoqIE5vdCB5ZXQgaW1wbGVtZW50ZWQgKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmlvcml0eShwaWQgPSAwKTogbnVtYmVyIHtcbiAgdmFsaWRhdGVJbnRlZ2VyUmFuZ2UocGlkLCBcInBpZFwiKTtcbiAgbm90SW1wbGVtZW50ZWQoU0VFX0dJVEhVQl9JU1NVRSk7XG59XG5cbi8qKiBSZXR1cm5zIHRoZSBzdHJpbmcgcGF0aCBvZiB0aGUgY3VycmVudCB1c2VyJ3MgaG9tZSBkaXJlY3RvcnkuICovXG5leHBvcnQgZnVuY3Rpb24gaG9tZWRpcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgLy8gTm90ZTogTm9kZS9saWJ1diBjYWxscyBnZXRwd3VpZCgpIC8gR2V0VXNlclByb2ZpbGVEaXJlY3RvcnkoKSB3aGVuIHRoZVxuICAvLyBlbnZpcm9ubWVudCB2YXJpYWJsZSBpc24ndCBzZXQgYnV0IHRoYXQncyB0aGUgKHZlcnkgdW5jb21tb24pIGZhbGxiYWNrXG4gIC8vIHBhdGguIElNTywgaXQncyBva2F5IHRvIHB1bnQgb24gdGhhdCBmb3Igbm93LlxuICBzd2l0Y2ggKG9zVHlwZSkge1xuICAgIGNhc2UgXCJ3aW5kb3dzXCI6XG4gICAgICByZXR1cm4gRGVuby5lbnYuZ2V0KFwiVVNFUlBST0ZJTEVcIikgfHwgbnVsbDtcbiAgICBjYXNlIFwibGludXhcIjpcbiAgICBjYXNlIFwiZGFyd2luXCI6XG4gICAgICByZXR1cm4gRGVuby5lbnYuZ2V0KFwiSE9NRVwiKSB8fCBudWxsO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBFcnJvcihcInVucmVhY2hhYmxlXCIpO1xuICB9XG59XG5cbi8qKiBSZXR1cm5zIHRoZSBob3N0IG5hbWUgb2YgdGhlIG9wZXJhdGluZyBzeXN0ZW0gYXMgYSBzdHJpbmcuICovXG5leHBvcnQgZnVuY3Rpb24gaG9zdG5hbWUoKTogc3RyaW5nIHtcbiAgcmV0dXJuIERlbm9VbnN0YWJsZS5ob3N0bmFtZSgpO1xufVxuXG4vKiogUmV0dXJucyBhbiBhcnJheSBjb250YWluaW5nIHRoZSAxLCA1LCBhbmQgMTUgbWludXRlIGxvYWQgYXZlcmFnZXMgKi9cbmV4cG9ydCBmdW5jdGlvbiBsb2FkYXZnKCk6IG51bWJlcltdIHtcbiAgaWYgKGlzV2luZG93cykge1xuICAgIHJldHVybiBbMCwgMCwgMF07XG4gIH1cbiAgcmV0dXJuIERlbm9VbnN0YWJsZS5sb2FkYXZnKCk7XG59XG5cbi8qKiBSZXR1cm5zIGFuIG9iamVjdCBjb250YWluaW5nIG5ldHdvcmsgaW50ZXJmYWNlcyB0aGF0IGhhdmUgYmVlbiBhc3NpZ25lZCBhIG5ldHdvcmsgYWRkcmVzcy5cbiAqIEVhY2gga2V5IG9uIHRoZSByZXR1cm5lZCBvYmplY3QgaWRlbnRpZmllcyBhIG5ldHdvcmsgaW50ZXJmYWNlLiBUaGUgYXNzb2NpYXRlZCB2YWx1ZSBpcyBhbiBhcnJheSBvZiBvYmplY3RzIHRoYXQgZWFjaCBkZXNjcmliZSBhbiBhc3NpZ25lZCBuZXR3b3JrIGFkZHJlc3MuICovXG5leHBvcnQgZnVuY3Rpb24gbmV0d29ya0ludGVyZmFjZXMoKTogTmV0d29ya0ludGVyZmFjZXMge1xuICBjb25zdCBpbnRlcmZhY2VzOiBOZXR3b3JrSW50ZXJmYWNlcyA9IHt9O1xuICBmb3IgKFxuICAgIGNvbnN0IHsgbmFtZSwgYWRkcmVzcywgbmV0bWFzaywgZmFtaWx5LCBtYWMsIHNjb3BlaWQsIGNpZHIgfSBvZiBEZW5vVW5zdGFibGVcbiAgICAgIC5uZXR3b3JrSW50ZXJmYWNlcygpXG4gICkge1xuICAgIGNvbnN0IGFkZHJlc3NlcyA9IGludGVyZmFjZXNbbmFtZV0gfHw9IFtdO1xuICAgIGNvbnN0IG5ldHdvcmtBZGRyZXNzOiBOZXR3b3JrQWRkcmVzcyA9IHtcbiAgICAgIGFkZHJlc3MsXG4gICAgICBuZXRtYXNrLFxuICAgICAgZmFtaWx5LFxuICAgICAgbWFjLFxuICAgICAgaW50ZXJuYWw6IChmYW1pbHkgPT09IFwiSVB2NFwiICYmIGlzSVB2NExvb3BiYWNrQWRkcihhZGRyZXNzKSkgfHxcbiAgICAgICAgKGZhbWlseSA9PT0gXCJJUHY2XCIgJiYgaXNJUHY2TG9vcGJhY2tBZGRyKGFkZHJlc3MpKSxcbiAgICAgIGNpZHIsXG4gICAgfTtcbiAgICBpZiAoZmFtaWx5ID09PSBcIklQdjZcIikge1xuICAgICAgbmV0d29ya0FkZHJlc3Muc2NvcGVpZCA9IHNjb3BlaWQhO1xuICAgIH1cbiAgICBhZGRyZXNzZXMucHVzaChuZXR3b3JrQWRkcmVzcyk7XG4gIH1cbiAgcmV0dXJuIGludGVyZmFjZXM7XG59XG5cbmZ1bmN0aW9uIGlzSVB2NExvb3BiYWNrQWRkcihhZGRyOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGFkZHIuc3RhcnRzV2l0aChcIjEyN1wiKTtcbn1cblxuZnVuY3Rpb24gaXNJUHY2TG9vcGJhY2tBZGRyKGFkZHI6IHN0cmluZykge1xuICByZXR1cm4gYWRkciA9PT0gXCI6OjFcIiB8fCBhZGRyID09PSBcImZlODA6OjFcIjtcbn1cblxuLyoqIFJldHVybnMgdGhlIGEgc3RyaW5nIGlkZW50aWZ5aW5nIHRoZSBvcGVyYXRpbmcgc3lzdGVtIHBsYXRmb3JtLiBUaGUgdmFsdWUgaXMgc2V0IGF0IGNvbXBpbGUgdGltZS4gUG9zc2libGUgdmFsdWVzIGFyZSAnZGFyd2luJywgJ2xpbnV4JywgYW5kICd3aW4zMicuICovXG5leHBvcnQgZnVuY3Rpb24gcGxhdGZvcm0oKTogc3RyaW5nIHtcbiAgcmV0dXJuIHByb2Nlc3MucGxhdGZvcm07XG59XG5cbi8qKiBSZXR1cm5zIHRoZSBvcGVyYXRpbmcgc3lzdGVtIGFzIGEgc3RyaW5nICovXG5leHBvcnQgZnVuY3Rpb24gcmVsZWFzZSgpOiBzdHJpbmcge1xuICByZXR1cm4gRGVub1Vuc3RhYmxlLm9zUmVsZWFzZSgpO1xufVxuXG4vKiogTm90IHlldCBpbXBsZW1lbnRlZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldFByaW9yaXR5KHBpZDogbnVtYmVyLCBwcmlvcml0eT86IG51bWJlcik6IHZvaWQge1xuICAvKiBUaGUgbm9kZSBBUEkgaGFzIHRoZSAncGlkJyBhcyB0aGUgZmlyc3QgcGFyYW1ldGVyIGFuZCBhcyBvcHRpb25hbC5cbiAgICAgICBUaGlzIG1ha2VzIGZvciBhIHByb2JsZW1hdGljIGltcGxlbWVudGF0aW9uIGluIFR5cGVzY3JpcHQuICovXG4gIGlmIChwcmlvcml0eSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgcHJpb3JpdHkgPSBwaWQ7XG4gICAgcGlkID0gMDtcbiAgfVxuICB2YWxpZGF0ZUludGVnZXJSYW5nZShwaWQsIFwicGlkXCIpO1xuICB2YWxpZGF0ZUludGVnZXJSYW5nZShwcmlvcml0eSwgXCJwcmlvcml0eVwiLCAtMjAsIDE5KTtcblxuICBub3RJbXBsZW1lbnRlZChTRUVfR0lUSFVCX0lTU1VFKTtcbn1cblxuLyoqIFJldHVybnMgdGhlIG9wZXJhdGluZyBzeXN0ZW0ncyBkZWZhdWx0IGRpcmVjdG9yeSBmb3IgdGVtcG9yYXJ5IGZpbGVzIGFzIGEgc3RyaW5nLiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRtcGRpcigpOiBzdHJpbmcgfCBudWxsIHtcbiAgLyogVGhpcyBmb2xsb3dzIHRoZSBub2RlIGpzIGltcGxlbWVudGF0aW9uLCBidXQgaGFzIGEgZmV3XG4gICAgIGRpZmZlcmVuY2VzOlxuICAgICAqIE9uIHdpbmRvd3MsIGlmIG5vbmUgb2YgdGhlIGVudmlyb25tZW50IHZhcmlhYmxlcyBhcmUgZGVmaW5lZCxcbiAgICAgICB3ZSByZXR1cm4gbnVsbC5cbiAgICAgKiBPbiB1bml4IHdlIHVzZSBhIHBsYWluIERlbm8uZW52LmdldCwgaW5zdGVhZCBvZiBzYWZlR2V0ZW52LFxuICAgICAgIHdoaWNoIHNwZWNpYWwgY2FzZXMgc2V0dWlkIGJpbmFyaWVzLlxuICAgICAqIE5vZGUgcmVtb3ZlcyBhIHNpbmdsZSB0cmFpbGluZyAvIG9yIFxcLCB3ZSByZW1vdmUgYWxsLlxuICAqL1xuICBpZiAoaXNXaW5kb3dzKSB7XG4gICAgY29uc3QgdGVtcCA9IERlbm8uZW52LmdldChcIlRFTVBcIikgfHwgRGVuby5lbnYuZ2V0KFwiVE1QXCIpO1xuICAgIGlmICh0ZW1wKSB7XG4gICAgICByZXR1cm4gdGVtcC5yZXBsYWNlKC8oPzwhOilbL1xcXFxdKiQvLCBcIlwiKTtcbiAgICB9XG4gICAgY29uc3QgYmFzZSA9IERlbm8uZW52LmdldChcIlNZU1RFTVJPT1RcIikgfHwgRGVuby5lbnYuZ2V0KFwiV0lORElSXCIpO1xuICAgIGlmIChiYXNlKSB7XG4gICAgICByZXR1cm4gYmFzZSArIFwiXFxcXHRlbXBcIjtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG4gIH0gZWxzZSB7IC8vICFpc1dpbmRvd3NcbiAgICBjb25zdCB0ZW1wID0gRGVuby5lbnYuZ2V0KFwiVE1QRElSXCIpIHx8IERlbm8uZW52LmdldChcIlRNUFwiKSB8fFxuICAgICAgRGVuby5lbnYuZ2V0KFwiVEVNUFwiKSB8fCBcIi90bXBcIjtcbiAgICByZXR1cm4gdGVtcC5yZXBsYWNlKC8oPzwhXilcXC8qJC8sIFwiXCIpO1xuICB9XG59XG5cbi8qKiBSZXR1cm4gdG90YWwgcGh5c2ljYWwgbWVtb3J5IGFtb3VudCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRvdGFsbWVtKCk6IG51bWJlciB7XG4gIHJldHVybiBEZW5vVW5zdGFibGUuc3lzdGVtTWVtb3J5SW5mbygpLnRvdGFsO1xufVxuXG4vKiogUmV0dXJucyBvcGVyYXRpbmcgc3lzdGVtIHR5cGUgKGkuZS4gJ1dpbmRvd3NfTlQnLCAnTGludXgnLCAnRGFyd2luJykgKi9cbmV4cG9ydCBmdW5jdGlvbiB0eXBlKCk6IHN0cmluZyB7XG4gIHN3aXRjaCAoRGVuby5idWlsZC5vcykge1xuICAgIGNhc2UgXCJ3aW5kb3dzXCI6XG4gICAgICByZXR1cm4gXCJXaW5kb3dzX05UXCI7XG4gICAgY2FzZSBcImxpbnV4XCI6XG4gICAgICByZXR1cm4gXCJMaW51eFwiO1xuICAgIGNhc2UgXCJkYXJ3aW5cIjpcbiAgICAgIHJldHVybiBcIkRhcndpblwiO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBFcnJvcihcInVucmVhY2hhYmxlXCIpO1xuICB9XG59XG5cbi8qKiBOb3QgeWV0IGltcGxlbWVudGVkICovXG5leHBvcnQgZnVuY3Rpb24gdXB0aW1lKCk6IG51bWJlciB7XG4gIG5vdEltcGxlbWVudGVkKFNFRV9HSVRIVUJfSVNTVUUpO1xufVxuXG4vKiogTm90IHlldCBpbXBsZW1lbnRlZCAqL1xuZXhwb3J0IGZ1bmN0aW9uIHVzZXJJbmZvKFxuICAvLyBkZW5vLWxpbnQtaWdub3JlIG5vLXVudXNlZC12YXJzXG4gIG9wdGlvbnM6IFVzZXJJbmZvT3B0aW9ucyA9IHsgZW5jb2Rpbmc6IFwidXRmLThcIiB9LFxuKTogVXNlckluZm8ge1xuICBub3RJbXBsZW1lbnRlZChTRUVfR0lUSFVCX0lTU1VFKTtcbn1cblxuZXhwb3J0IGNvbnN0IGNvbnN0YW50cyA9IHtcbiAgLy8gVVZfVURQX1JFVVNFQUREUjogNCwgIC8vc2VlIGh0dHBzOi8vbm9kZWpzLm9yZy9kb2NzL2xhdGVzdC12MTIueC9hcGkvb3MuaHRtbCNvc19saWJ1dl9jb25zdGFudHNcbiAgZGxvcGVuOiB7XG4gICAgLy8gc2VlIGh0dHBzOi8vbm9kZWpzLm9yZy9kb2NzL2xhdGVzdC12MTIueC9hcGkvb3MuaHRtbCNvc19kbG9wZW5fY29uc3RhbnRzXG4gIH0sXG4gIGVycm5vOiB7XG4gICAgLy8gc2VlIGh0dHBzOi8vbm9kZWpzLm9yZy9kb2NzL2xhdGVzdC12MTIueC9hcGkvb3MuaHRtbCNvc19lcnJvcl9jb25zdGFudHNcbiAgfSxcbiAgLy8gTmVlZHMgdG8gYmUga2VwdCBpbiBzeW5jIHdpdGggYERlbm8uU2lnbmFsYCB0eXBlLlxuICBzaWduYWxzOiB7XG4gICAgXCJTSUdBQlJUXCI6IFwiU0lHQUJSVFwiLFxuICAgIFwiU0lHQUxSTVwiOiBcIlNJR0FMUk1cIixcbiAgICBcIlNJR0JVU1wiOiBcIlNJR0JVU1wiLFxuICAgIFwiU0lHQ0hMRFwiOiBcIlNJR0NITERcIixcbiAgICBcIlNJR0NPTlRcIjogXCJTSUdDT05UXCIsXG4gICAgXCJTSUdFTVRcIjogXCJTSUdFTVRcIixcbiAgICBcIlNJR0ZQRVwiOiBcIlNJR0ZQRVwiLFxuICAgIFwiU0lHSFVQXCI6IFwiU0lHSFVQXCIsXG4gICAgXCJTSUdJTExcIjogXCJTSUdJTExcIixcbiAgICBcIlNJR0lORk9cIjogXCJTSUdJTkZPXCIsXG4gICAgXCJTSUdJTlRcIjogXCJTSUdJTlRcIixcbiAgICBcIlNJR0lPXCI6IFwiU0lHSU9cIixcbiAgICBcIlNJR0tJTExcIjogXCJTSUdLSUxMXCIsXG4gICAgXCJTSUdQSVBFXCI6IFwiU0lHUElQRVwiLFxuICAgIFwiU0lHUFJPRlwiOiBcIlNJR1BST0ZcIixcbiAgICBcIlNJR1BXUlwiOiBcIlNJR1BXUlwiLFxuICAgIFwiU0lHUVVJVFwiOiBcIlNJR1FVSVRcIixcbiAgICBcIlNJR1NFR1ZcIjogXCJTSUdTRUdWXCIsXG4gICAgXCJTSUdTVEtGTFRcIjogXCJTSUdTVEtGTFRcIixcbiAgICBcIlNJR1NUT1BcIjogXCJTSUdTVE9QXCIsXG4gICAgXCJTSUdTWVNcIjogXCJTSUdTWVNcIixcbiAgICBcIlNJR1RFUk1cIjogXCJTSUdURVJNXCIsXG4gICAgXCJTSUdUUkFQXCI6IFwiU0lHVFJBUFwiLFxuICAgIFwiU0lHVFNUUFwiOiBcIlNJR1RTVFBcIixcbiAgICBcIlNJR1RUSU5cIjogXCJTSUdUVElOXCIsXG4gICAgXCJTSUdUVE9VXCI6IFwiU0lHVFRPVVwiLFxuICAgIFwiU0lHVVJHXCI6IFwiU0lHVVJHXCIsXG4gICAgXCJTSUdVU1IxXCI6IFwiU0lHVVNSMVwiLFxuICAgIFwiU0lHVVNSMlwiOiBcIlNJR1VTUjJcIixcbiAgICBcIlNJR1ZUQUxSTVwiOiBcIlNJR1ZUQUxSTVwiLFxuICAgIFwiU0lHV0lOQ0hcIjogXCJTSUdXSU5DSFwiLFxuICAgIFwiU0lHWENQVVwiOiBcIlNJR1hDUFVcIixcbiAgICBcIlNJR1hGU1pcIjogXCJTSUdYRlNaXCIsXG4gIH0sXG4gIHByaW9yaXR5OiB7XG4gICAgLy8gc2VlIGh0dHBzOi8vbm9kZWpzLm9yZy9kb2NzL2xhdGVzdC12MTIueC9hcGkvb3MuaHRtbCNvc19wcmlvcml0eV9jb25zdGFudHNcbiAgfSxcbn07XG5cbmV4cG9ydCBjb25zdCBFT0wgPSBpc1dpbmRvd3MgPyBmc0VPTC5DUkxGIDogZnNFT0wuTEY7XG5leHBvcnQgY29uc3QgZGV2TnVsbCA9IGlzV2luZG93cyA/IFwiXFxcXFxcXFwuXFxcXG51bFwiIDogXCIvZGV2L251bGxcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBhcmNoLFxuICBjcHVzLFxuICBlbmRpYW5uZXNzLFxuICBmcmVlbWVtLFxuICBnZXRQcmlvcml0eSxcbiAgaG9tZWRpcixcbiAgaG9zdG5hbWUsXG4gIGxvYWRhdmcsXG4gIG5ldHdvcmtJbnRlcmZhY2VzLFxuICBwbGF0Zm9ybSxcbiAgcmVsZWFzZSxcbiAgc2V0UHJpb3JpdHksXG4gIHRtcGRpcixcbiAgdG90YWxtZW0sXG4gIHR5cGUsXG4gIHVwdGltZSxcbiAgdXNlckluZm8sXG4gIGNvbnN0YW50cyxcbiAgRU9MLFxuICBkZXZOdWxsLFxufTtcbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUsc0RBQXNEO0FBQ3RELEVBQUU7QUFDRiwwRUFBMEU7QUFDMUUsZ0VBQWdFO0FBQ2hFLHNFQUFzRTtBQUN0RSxzRUFBc0U7QUFDdEUsNEVBQTRFO0FBQzVFLHFFQUFxRTtBQUNyRSx3QkFBd0I7QUFDeEIsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSx5REFBeUQ7QUFDekQsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSw2REFBNkQ7QUFDN0QsNEVBQTRFO0FBQzVFLDJFQUEyRTtBQUMzRSx3RUFBd0U7QUFDeEUsNEVBQTRFO0FBQzVFLHlDQUF5QztBQUN6QyxZQUFZLGtCQUFrQix1QkFBdUI7QUFDckQsU0FBUyxjQUFjLFFBQVEsY0FBYztBQUM3QyxTQUFTLG9CQUFvQixRQUFRLGNBQWM7QUFDbkQsU0FBUyxPQUFPLEtBQUssUUFBUSxlQUFlO0FBQzVDLE9BQU8sYUFBYSxlQUFlO0FBQ25DLFNBQVMsU0FBUyxFQUFFLE1BQU0sUUFBUSxpQkFBaUI7QUFFbkQsTUFBTSxtQkFBbUI7QUFrRXpCLE9BQU8sU0FBUyxPQUFlO0lBQzdCLE9BQU8sUUFBUSxJQUFJO0FBQ3JCLENBQUM7QUFFRCxtQ0FBbUM7QUFDbEMsSUFBWSxDQUFDLE9BQU8sV0FBVyxD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