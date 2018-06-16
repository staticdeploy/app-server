export default function removeTrailingSlash(path: string) {
    return /\/$/.test(path) ? path.slice(0, -1) : path;
}
