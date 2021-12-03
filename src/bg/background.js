let nodes = null,
	timeout = setTimeout(() => {}, 1860000)

const bg = chrome.extension.getBackgroundPage()

async function getNodes() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(null, (items) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve(items['nodes']);
		})
	})
}

async function getRemainder() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(null, (items) => {
			if (chrome.runtime.lastError) {
				return reject(chrome.runtime.lastError);
			}
			resolve(items['remaind']);
		})
	})
}

const audio = new Audio('sound.mp3')

async function openNodes() {
	nodes.forEach(link => window.open(link, '_blank'))
	restartTimeout()
}

async function farm() {
	nodes = await getNodes()
	openNodes()
}

async function restartTimeout() {
	clearTimeout(timeout)
	if (await getRemainder()) {
		timeout = setTimeout(popup, 1860000)
	}
}

async function popup() {
	audio.play()
	if (await getRemainder()) {
		result = confirm('Farm now?')
		if (result == 1) {
			farm()
		} else {
			restartTimeout()
		}
	} else {
		clearTimeout(timeout)
	}
}

const main = async () => {
	chrome.extension.onConnect.addListener(async port => {
		bg.console.log('Connected');
		port.onMessage.addListener(async msg => {
			if (msg == 'Farm') {
				farm()
			}
		})
	})
}
main()