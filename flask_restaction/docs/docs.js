function parseMeta(meta) {
    let basic = {}
    let roles = null;
    let resources = {}
    for (let k in meta) {
        if (k.slice(0, 1) == '$') {
            if (k != "$roles") {
                basic[k] = meta[k]
            } else {
                roles = meta[k]
            }
        } else {
            resources[k] = meta[k]
        }
    }
    return { basic, roles, resources }
}

function isAllow(role, resource, action) {
    if (role[resource]) {
        if (role[resource].indexOf(action) > 0) {
            return true
        }
    }
    return false
}

function parseRole(role, resources) {
    let result = {}
    for (let resource in resources) {
        result[resource] = {}
        for (let action in resources[resource]) {
            if (isSpecial(action)) {
                continue
            }
            result[resource][action] = {
                desc: resources[resource][action].$desc,
                allow: isAllow(role, resource, action)
            }
        }
    }
    return result
}

function isEmpty(value) {
    return !value || Object.keys(value).length === 0
}

function isSpecial(value) {
    return !value || value.slice(0, 1) == '$'
}
window.isEmpty = isEmpty
window.isSpecial = isSpecial

let app = new Vue({
    el: '#app',
    data: {
        meta: null,
        basic: null,
        roles: null,
        resources: null,
        view: null,
        role: null,
        roleName: null,
        resource: null,
        resourceName: null,
        sidebar: true
    },
    methods: {
        showMeta() {
            this.view = 'meta'
        },
        showTerminal() {
            this.view = 'terminal'
        },
        showBasic() {
            this.view = 'basic'
        },
        showRole(name) {
            this.roleName = name
            this.role = parseRole(this.roles[name], this.resources)
            this.view = 'role'
        },
        showResource(name) {
            this.resourceName = name
            this.resource = this.resources[name]
            this.view = 'resource'
        },
        toggleSidebar() {
            this.sidebar = !this.sidebar
        },
        hideSidebar() {
            if (window.innerWidth < 768) {
                this.sidebar = false
            }
        },

    },
    created: function() {
        let metaText = document.getElementById('meta').value
        let meta = parseMeta(JSON.parse(metaText))
        this.meta = meta
        this.basic = meta.basic
        this.roles = meta.roles
        this.resources = meta.resources
    },
    mounted: function() {
        this.showBasic()
    },
    directives: {
        marked: {
            bind: function(el, binding) {
                if (binding.value && binding.value != binding.oldValue) {
                    el.innerHTML = marked(binding.value)
                }
            }
        }
    }
})

window.app = app
