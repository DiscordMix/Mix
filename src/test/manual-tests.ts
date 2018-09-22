import CommandXmlParser from "../commands/command-xml-parser";

async function run(): Promise<void> {
    console.log(__dirname);

    const parsed: any = await CommandXmlParser.parseFromFile("src/test/test-command-xml.xml");

    console.log(parsed.command.arguments[0].argument[0].$.required);
}

run();