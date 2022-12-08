class Api{
    url = "";

    constructor(url) {
        this.url = url;
    }

    create(data) {
        const JSONData = JSON.stringify(data);
        console.log(`Sending ${JSONData} to ${this.url}`);

        const request = new Request(this.url, {
            method: 'POST',
            body: JSONData,
            headers: {
                'content-type': 'application/json'
            }
        });

        return fetch(request)
            .then((result) => result.json())
            .then((data) => data)
            .catch((err) => console.log(err));
    }

    async getAll() {
        return fetch(this.url)
                .then((result) => result.json())
                .then((data) => data);
    }

    remove(id) {
        console.log(`Removing task with id: ${id}`);
        return fetch(`${this.url}/${id}`, {method: 'DELETE'})
               .then((result) => result).catch((err) => console.log(err));
    }

    async update(data) {
        //console.log(data);
        const request = new Request(this.url, {
            method: 'PUT',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        
        //var out = fetch(request).then((result) => result.json()).then((data) => data).catch((err) => console.log(err));
        //var out = {};
        const out = await fetch(request);
        //var out = fetch(request);
        //console.log(out);
        return out;
    }
}