import { 
	App, 
	Editor, 
	MarkdownView, 
	Modal, 
	Notice, 
	Plugin, 
	PluginSettingTab, 
	Setting,
} from 'obsidian';

// Remember to rename these classes and interfaces!

interface WeeklyReviewSettings {
	mySetting: string;
}

const DEFAULT_SETTINGS: WeeklyReviewSettings = {
	daysAgo: 7
}

export default class WeeklyReview extends Plugin {
	settings: WeeklyReviewSettings;

	async onload() {
		await this.loadSettings();

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'Start Review',
			name: 'Start Review',
			callback: () => {
				const files = this.app.vault.getMarkdownFiles();

				let start = moment(moment().startOf('day')).subtract(this.settings.daysAgo, "days");
				let recentFiles = files.filter(f => start.isBefore(moment(f.stat.ctime)));

				new Notice(`Opening ${recentFiles.length} files created in the last ${this.settings.daysAgo} days.`);

				recentFiles.forEach((f) => {
					let leaf = app.workspace.getLeaf('tab');
					leaf.openFile(f)
				})
			}
		});

		// This adds a separate recap command to the plugin using similar code
		this.addCommand({
			id: 'Start Recap',
			name: 'Start Recap',
			callback: async () => this.startRecap(),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new WeeklyReviewSettingTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async startRecap() {
		// Opens modal for user input of how many days back they want to check
		const modal = new Modal(this.app);
		const recapTime = await modal.open();
		const files = this.app.vault.getMarkdownFiles();

		// Repurposed code from Review to get fils from the input number recapTime
		let start = moment(moment().startOf('day')).subtract(recapTime);
		let recentFiles = files.filter(f => start.isBefore(moment(f.stat.ctime)));

		new Notice(`Scanning ${recentFiles.length} files created in the last ${recapTime} days.`);

		//Scan the data needed from the files and print it to a document (words most used, files created (and list them), tag frquency, average words/characters per file)
		//CHECK AND SEE IF THIS IS HOW YOU CREATE A NOTE ITS ALMOST CERTAINLY WRONG
		let recapNote = this.create(path: './', data: string, options?: DataWriteOptions): Promise<TFile>;
		

		new Notice(`Opening Recap.`);
	}
}

class WeeklyReviewSettingTab extends PluginSettingTab {
	plugin: WeeklyReview;

	constructor(app: App, plugin: WeeklyReview) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Weekly Review'});

		new Setting(containerEl)
			.setName('How many days to show?')
			.setDesc('Typically this is 7')
			.addText(text => text
				.setPlaceholder('Days')
				.setValue(this.plugin.settings.daysAgo.toString())
				.onChange(async (value) => {
					this.plugin.settings.daysAgo = parseInt(value);
					await this.plugin.saveSettings();
				}));
	}
}

export class PopupModal extends Modal {
	result: string;
	onSubmit: (result: string) => void;

	constructor(app: App, plugin: WeeklyReview, onSubmit: (result: string) => void) {
		super(app, plugin);
		this.plugin = plugin;
		this.onSubmit = onSubmit;
	  }
	
	  onOpen() {
		const { recapInput } = this;
	
		recapInput.createEl("h1", { text: "Recap" });
	
		new Setting(recapInput)
		  .setName("How many days ago do you want to recap?")
		  .addText((text) =>
			text.onChange((value) => {
			  this.result = value
			}));
	
		new Setting(recapInput)
		  .addButton((btn) =>
			btn
			  .setButtonText("Submit")
			  .setCta()
			  .onClick(() => {
				this.close();
				this.onSubmit(this.result);
			  }));
	  }
	
	  onClose() {
		let { recapInput } = this;
		recapInput.empty();
	  }
}
