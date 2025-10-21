import { type SomeCompanionConfigField } from '@companion-module/base'

export interface ModuleConfig {
	wsPort: number
}

export function GetConfigFields(): SomeCompanionConfigField[] {
	return [
		{
			type: 'number',
			id: 'wsPort',
			label: 'Port for WebSocket access',
			width: 6,
			min: 1,
			max: 65535,
			default: 8181,
		},
	]
}
