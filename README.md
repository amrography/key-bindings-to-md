# vscode Key Bindings to markdown extension

View on [Marketplace](https://marketplace.visualstudio.com/items?itemName=akhaled.key-bindings-to-md)
Submit your issues/suggestions [here](https://github.com/amrography/key-bindings-to-md/issues)

Generate you key bindings list to markdown file

---

## Usage

### Command Palette

Sort by command name

- `keybindings: Generate markdown`

Sort by key

- `keybindings: Generate markdown - sort by keys`

Group by extension name, sorted by command name

- `Keybindings: Generate markdown (Group by extension name)`
  
Group by extension name, sorted by key

- `Keybindings: Generate markdown (Group by extension name) - sort by keys`
  
---

Default output location is **.vscode/keybindings.md**.

#### To ignore commands from displaying

1. Open settings file, hit cmd+p then type `Preferences: Open Settings (JSON)`
2. Look for key `keybindings-to-md.remove-commands-on-generate`
3. Update the existing array value with full command name, you can view commands by run `> Preferences: Open Keyboard Shortcuts (JSON)`

example:

```json
    "keybindings-to-md.remove-commands-on-generate" : [
        ...
        workbench.action.exitZenMode,
        ...
    ]
```
