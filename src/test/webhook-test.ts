import {Coordinator} from "../automation/coordinator";

const coordinator: Coordinator = new Coordinator();

const port: number = coordinator.githubWebhook("k3yboard_cat!", (body: any) => {
    console.log("Received webhook trigger with body", body);
});

console.log(`Webhook Test ready | Port ${port}`);