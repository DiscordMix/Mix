import {Coordinator} from "../automation/coordinator";

const coordinator: Coordinator = new Coordinator();

const githubPort: number = coordinator.githubWebhook("k3yboard_cat!", (body: any) => {
    console.log("Github | Received webhook trigger with body", body);
});

const normalPort: number = coordinator.webhook((body: any) => {
    console.log("Normal | Received webhook trigger with body", body);
}, "k3yboard_cat!");

console.log(`Github webhook ready | Port ${githubPort}`);
console.log(`Normal webhook ready | Port ${normalPort}`);