import Assets from "../config/Assets.js";

class CommonDBO {
    async getCommonLists(key, data = {}, { session } = {}) {
        let lists;

        switch (key) {
            case 'country':
                lists = await this.getCountries({ session });
                break;
            case 'state':
                lists = await this.getStates(data.countryCode, { session });
                break;
            case 'city':
                lists = await this.getCities(data.stateCode, data.countryCode, { session });
                break;
            case 'currency':
                lists = await this.getCurrencies({ session });
                break;
            case 'language':
                lists = await this.getLanguages({ session });
                break;
            case 'timezone':
                lists = await this.getTimezones({ session });
                break;
            case 'unit':
                lists = await this.getUnits({ session });
                break;
            case 'status':
                lists = await this.getStatuses({ session });
                break;
            case 'role':
                lists = await this.getRoles({ session });
                break;
            case 'permission':
                lists = await this.getPermissions({ session });
                break;
        }

        return {
            [key]: lists || []
        };
    }

    async getCountries({ session }) {
        const { default: countries } = await import('../config/data/countries.json', {
            assert: { type: 'json' }
        });
        return countries;
    }

    async getStates(countryCode, { session } = {}) {
        const { default: states } = await import('../config/data/states.json', {
            assert: { type: 'json' }
        });
        return countryCode ? states[countryCode] || [] : states;
    }

    async getCities(stateCode, countryCode, { session } = {}) {
        const { default: cities } = await import('../config/data/cities.json', {
            assert: { type: 'json' }
        });
        if (stateCode && countryCode) {
            return (cities[countryCode] || []).filter(c => c.stateCode === stateCode);
        } else if (countryCode) {
            return cities[countryCode] || [];
        } else if (stateCode) {
            return Object.values(cities).flat().filter(c => c.stateCode === stateCode);
        } else {
            return Object.values(cities).flat();
        }
    }


    async getCurrencies({ session }) {
        return [
            { id: "1", code: "USD", name: "US Dollar" },
            { id: "2", code: "CAD", name: "Canadian Dollar" },
            { id: "3", code: "INR", name: "Indian Rupee" }
        ];
    }

    async getLanguages({ session }) {
        return [
            { id: "1", code: "en", name: "English" },
            { id: "2", code: "fr", name: "French" },
            { id: "3", code: "hi", name: "Hindi" }
        ];
    }

    async getTimezones({ session }) {
        return [
            { id: "1", code: "UTC-8", name: "Pacific Time (US & Canada)" },
            { id: "2", code: "UTC-5", name: "Eastern Time (US & Canada)" },
            { id: "3", code: "UTC+5:30", name: "India Standard Time" }
        ];
    }

    async getUnits({ session }) {
        return [
            { id: "1", code: "kg", name: "Kilogram" },
            { id: "2", code: "lb", name: "Pound" },
            { id: "3", code: "ltr", name: "Litre" },
            { id: "4", code: "pcs", name: "Pieces" }
        ];
    }

    async getStatuses({ session }) {
        return [
            { id: "1", code: "active", name: "Active" },
            { id: "2", code: "inactive", name: "Inactive" },
            { id: "3", code: "pending", name: "Pending" },
            { id: "4", code: "archived", name: "Archived" }
        ];
    }

    async getRoles({ session }) {
        return [
            { id: "1", code: "admin", name: "Administrator" },
            { id: "2", code: "editor", name: "Editor" },
            { id: "3", code: "viewer", name: "Viewer" },
            { id: "4", code: "moderator", name: "Moderator" }
        ];
    }

    async getPermissions({ session }) {
        return [
            { id: "1", code: "read", name: "Read" },
            { id: "2", code: "write", name: "Write" },
            { id: "3", code: "delete", name: "Delete" },
            { id: "4", code: "manage_users", name: "Manage Users" }
        ];
    }
}

export default new CommonDBO();
