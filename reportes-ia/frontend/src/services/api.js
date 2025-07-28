export async function uploadData(file) {
    const form = new FormData();
    form.append("file", file);

    const res = await fetch("http://localhost:8000/upload/", {
        method: "POST",
        body: form
    });
    return await res.json();
}