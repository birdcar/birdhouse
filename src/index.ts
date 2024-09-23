import { helpers, termost } from "termost";

type ProgramContext = {
	globalFlag: string;
};

type DebugCommandContext = {
	localFlag: string;
};

const program = termost<ProgramContext>("CLI example", {
	onException(error) {
		console.error(`Error logic ${error.message}`);
	},
	onShutdown() {
		console.log("Clean-up logic");
	},
});

program.option({
	key: "globalFlag",
	name: { long: "global", short: "g" },
	description:
		"A global flag/option example accessible by all commands (key is used to persist the value into the context object)",
	defaultValue:
		"A default value can be set if no flag is provided by the user",
});

program
	.command({
		name: "build",
		description:
			"A custom command example runnable via `bin-name build` (command help available via `bin-name build --help`)",
	})
	.task({
		label: "A label can be displayed to follow the task progress",
		async handler() {
			await fakeBuild();
		},
	});

program
	.command<DebugCommandContext>({
		name: "debug",
		description: "A command to play with Termost capabilities",
	})
	.option({
		key: "localFlag",
		name: "local",
		description: "A local flag accessible only by the `debug` command",
		defaultValue: "local-value",
	})
	.task({
		handler(context, argv) {
			helpers.message(`Hello, I'm the ${argv.command} command`);
			helpers.message(`Context value = ${JSON.stringify(context)}`);
			helpers.message(`Argv value = ${JSON.stringify(argv)}`);
		},
	});

const fakeBuild = async () => {
	return new Promise((resolve) => {
		setTimeout(resolve, 3000);
	});
};
