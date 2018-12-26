import {Coordinator} from "../automation/coordinator";

const coordinator: Coordinator = new Coordinator();
const secret: string = "keyboard_cat";

const githubPort: number = coordinator.githubWebhook(secret, (body: any) => {
    console.log("Github | Received webhook trigger with body", body);
});

const normalPort: number = coordinator.webhook((body: any) => {
    console.log("Normal | Received webhook trigger with body", body);
}, secret);

console.log(`Github webhook ready | Port ${githubPort}`);
console.log(`Normal webhook ready | Port ${normalPort}`);