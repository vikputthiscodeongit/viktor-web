export default async function initFormMc(formEl) {
    const mcLabel = formEl.querySelector("#cf-mc").previousElementSibling;
    mcLabel.textContent = "MC LOADING";

    try {
        const problem = await getProblem();
        console.log(problem);
        mcLabel.textContent = `${problem[0]} + ${problem[1]} =`;

        return true;
    } catch (error) {
        return console.error(error);
    }
}

async function getProblem() {
    try {
        const response = await fetch("./components/form-mc/form-mc-generator.php", { method: "GET" });

        if (!response.ok) {
            console.warn("Recieved erroreous response.");
        }

        const data = await response.json();
        console.log(data);

        return data;
    } catch (error) {
        return console.error(error);
    }
}
