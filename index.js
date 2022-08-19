import fetch from "node-fetch";
import _ from "lodash";

const urls = ["https://dummy.restapiexample.com/api/v1/employee/1",
"https://dummy.restapiexample.com/api/v1/employee/2",
"https://dummy.restapiexample.com/api/v1/employee/3", 
"https://dummy.restapiexample.com/api/v1/employee/4",
"https://dummy.restapiexample.com/api/v1/employee/5",
"https://dummy.restapiexample.com/api/v1/employee/6"];

/*const urls = ['https://api.github.com/users/iliakan',
'https://api.github.com/users/remy',
'https://api.github.com/users/jeresig'];*/

const MAX_CONCURRENCY = 3;
const MAX_RETRY = 3;
let retries = 0;

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

const fetchUrl = async (url) => {
    let data;
    try {
        const response = await fetch(url);

        // Throw an exception on client and server error statuses to return an object indicating that the url need to retry.
        if(response.status > 400){
            throw new Error();
        }

        const json = await response.json();
        data = {
            ...json,
            success: true
        }
    } catch (error) {
        console.log(`Retrying ${url}`);
        data = { url, success: false };
    }

    return data;
}

const buildRequests = (urls) => {
    const requests = [];

    for (let index = 0; index < urls.length; index++) {
        console.log(`Building request index: ${index}`);
        const request = fetchUrl(urls[index]);
        requests.push(request);
    }

    return requests;
}

const retry = async (responsesToRetry, responses) => {
    if (responsesToRetry.length > 0 && retries < MAX_RETRY) {
        console.log(`Retry number: ${(retries + 1)}`);
        responses = responses.filter(x => x.success);
        const urlsToRetry = responsesToRetry.map(x => x.url);

        // Delay operation to cool down rate limiter.
        await delay(1000);
        
        retries++;
        const retryResponses = await fetchURLs(urlsToRetry);
        responses = responses.concat(retryResponses);
    }
}

const fetchURLs = async(urls) => {
    const requests = buildRequests (urls);

    const maxSplit = Math.ceil(requests.length / MAX_CONCURRENCY);
    console.log({maxSplit});

    let responses = []
    for (let index = 0; index < maxSplit; index++) {
        const responsesExecuted = await Promise.all(requests.splice(0, MAX_CONCURRENCY));
        responses = responses.concat(responsesExecuted);
    }

    const responsesToRetry = responses.filter(x => !x.success);
    await retry(responsesToRetry, responses);

    return responses;
}

// Log responses sorted by success.
fetchURLs(urls).then((responses) => console.log(_.cloneDeep(responses.sort((a, b) => b.success - a.success))));