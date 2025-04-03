class DiscountManager {
    constructor() {
        this.discountAddType = document.getElementById("discount__add-type");
        this.discountAddCode = document.getElementById("discount__add-code");
        this.discountAddPercent = document.getElementById("discount__add-percent");
        this.discountAddQuantity = document.getElementById("discount__add-quantity");
        this.discountAddName = document.getElementById("discount__add-name");
        this.discountAddSpecialPercent = document.getElementById("discount__add-special-percent");
        this.discountAddButton = document.getElementById("discount__add-button");
        this.discountUpdateId = document.getElementById("discount__update-id");
        this.discountUpdateType = document.getElementById("discount__update-type");
        this.discountUpdateCode = document.getElementById("discount__update-code");
        this.discountUpdatePercent = document.getElementById("discount__update-percent");
        this.discountUpdateQuantity = document.getElementById("discount__update-quantity");
        this.discountUpdateName = document.getElementById("discount__update-name");
        this.discountUpdateSpecialPercent = document.getElementById("discount__update-special-percent");
        this.discountUpdateButton = document.getElementById("discount__update-button");
        this.discountDeleteType = document.getElementById("discount__delete-type");
        this.discountDeleteId = document.getElementById("discount__delete-id");
        this.discountDeleteButton = document.getElementById("discount__delete-button");
        this.init();
    }

    init() {
        if (this.discountAddType) {
            this.discountAddType.addEventListener("change", () => this.toggleAddFields());
        }
        if (this.discountAddButton) {
            this.discountAddButton.addEventListener("click", () => this.handleAddDiscount());
        }
        if (this.discountUpdateId) {
            this.discountUpdateId.addEventListener("input", () => this.trackUpdateDiscountId());
        }
        if (this.discountUpdateType) {
            this.discountUpdateType.addEventListener("change", () => this.toggleUpdateFields());
        }
        if (this.discountUpdateButton) {
            this.discountUpdateButton.addEventListener("click", () => this.handleUpdateDiscount());
        }
        if (this.discountDeleteType) {
            this.discountDeleteType.addEventListener("change", () => this.toggleDeleteButton());
        }
        if (this.discountDeleteId) {
            this.discountDeleteId.addEventListener("input", () => this.toggleDeleteButton());
        }
        if (this.discountDeleteButton) {
            this.discountDeleteButton.addEventListener("click", () => this.handleDeleteDiscount());
        }
    }

    toggleAddFields() {
        const type = this.discountAddType.value;
        const promoFields = document.querySelectorAll(".promo-fields");
        const specialFields = document.querySelectorAll(".special-fields");
        promoFields.forEach(field => field.style.display = type === "promo" ? "block" : "none");
        specialFields.forEach(field => field.style.display = type === "special" ? "block" : "none");
        this.discountAddButton.disabled = type === "";
    }

    toggleUpdateFields() {
        const type = this.discountUpdateType.value;
        const promoFields = document.querySelectorAll(".promo-update-fields");
        const specialFields = document.querySelectorAll(".special-update-fields");
        promoFields.forEach(field => field.style.display = type === "promo" ? "block" : "none");
        specialFields.forEach(field => field.style.display = type === "special" ? "block" : "none");
        this.discountUpdateButton.disabled = type === "";
    }

    toggleDeleteButton() {
        const type = this.discountDeleteType.value;
        const id = this.discountDeleteId.value.trim();
        this.discountDeleteButton.disabled = !(type && id);
    }

    async trackUpdateDiscountId() {
        const id = this.discountUpdateId.value.trim();
        const type = this.discountUpdateType.value;
        if (id === "" || type === "") {
            this.resetUpdateForm();
            return;
        }
        try {
            const data = await this.getDiscountById(id, type);
            if (data) {
                this.discountUpdateType.value = data.type || "";
                this.toggleUpdateFields();
                if (data.type === "promo") {
                    this.discountUpdateCode.value = data.code || "";
                    this.discountUpdatePercent.value = data.percent || "";
                    this.discountUpdateQuantity.value = data.quantity || "";
                } else if (data.type === "special") {
                    this.discountUpdateName.value = data.name || "";
                    this.discountUpdateSpecialPercent.value = data.percent || "";
                }
                this.discountUpdateButton.disabled = false;
            } else {
                throw new Error("Скидка не найдена");
            }
        } catch (error) {
            console.error("Ошибка при получении скидки:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async getDiscountById(discountId, type) {
        const endpoint = type === "promo" 
            ? "/api/discount_code" 
            : "/api/discount_special";
        try {
            const response = await fetch(endpoint);
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }
            const discounts = await response.json();
            const discount = discounts.find(discount => discount.id == discountId);
            if (!discount) {
                throw new Error("Скидка не найдена");
            }
            return { ...discount, type };
        } catch (error) {
            console.error("Ошибка при получении скидки:", error);
            return null;
        }
    }

    async generateDiscountTable(container) {
        if (!container) {
            console.error("Контейнер для таблицы скидок не найден");
            return;
        }
        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Тип</th>
                        <th>Код/Название</th>
                        <th>Процент</th>
                        <th>Количество</th>
                    </tr>
                </thead>
                <tbody id="discount-table-body">
                </tbody>
            </table>
        `;
        try {
            const [specialResponse, codeResponse] = await Promise.all([
                fetch("/api/discount_special"),
                fetch("/api/discount_code")
            ]);
            if (!specialResponse.ok || !codeResponse.ok) {
                throw new Error("Ошибка при загрузке данных о скидках");
            }
            const specialDiscounts = await specialResponse.json();
            const codeDiscounts = await codeResponse.json();
            const allDiscounts = [
                ...specialDiscounts.map(discount => ({ ...discount, type: "special" })),
                ...codeDiscounts.map(discount => ({ ...discount, type: "promo" }))
            ];
            const tbody = document.getElementById("discount-table-body");
            tbody.innerHTML = "";
            allDiscounts.forEach(discount => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${discount.id}</td>
                    <td>${discount.type === "promo" ? "Промокод" : "Специальная скидка"}</td>
                    <td>${discount.type === "promo" ? discount.code : discount.name}</td>
                    <td>${discount.percent}%</td>
                    <td>${discount.type === "promo" ? discount.quantity : "-"}</td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error("Ошибка при загрузке данных для таблицы:", error);
        }
    }

    async handleAddDiscount() {
        const type = this.discountAddType.value;
        const code = this.discountAddCode.value.trim();
        const percent = parseFloat(this.discountAddPercent.value);
        const quantity = parseInt(this.discountAddQuantity.value);
        const name = this.discountAddName.value.trim();
        const specialPercent = parseFloat(this.discountAddSpecialPercent.value);
        if (!this.validateFields(type, code, percent, quantity, name, specialPercent)) {
            alert("Пожалуйста, заполните все поля корректно.");
            return;
        }
        const data = {
            type: type,
            code: type === "promo" ? code : undefined,
            percent: type === "promo" ? percent : specialPercent,
            quantity: type === "promo" ? quantity : undefined,
            name: type === "special" ? name : undefined
        };
        try {
            const response = await this.addDiscount(data);
            if (response.ok) {
                this.resetAddForm();
                const discountTableContainer = document.querySelector(".table__discount");
                if (discountTableContainer) {
                    await this.generateDiscountTable(discountTableContainer);
                }
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при добавлении скидки:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    validateFields(type, code, percent, quantity, name, specialPercent) {
        if (type === "promo") {
            return code && !isNaN(percent) && !isNaN(quantity);
        } else if (type === "special") {
            return name && !isNaN(specialPercent);
        }
        return false;
    }

    async handleUpdateDiscount() {
        const id = this.discountUpdateId.value.trim();
        const type = this.discountUpdateType.value;
        const code = this.discountUpdateCode.value.trim();
        const percent = parseFloat(this.discountUpdatePercent.value);
        const quantity = parseInt(this.discountUpdateQuantity.value);
        const name = this.discountUpdateName.value.trim();
        const specialPercent = parseFloat(this.discountUpdateSpecialPercent.value);
        if (!this.validateFields(type, code, percent, quantity, name, specialPercent)) {
            alert("Пожалуйста, заполните все поля корректно.");
            return;
        }
        const data = {
            id: id,
            type: type,
            code: type === "promo" ? code : undefined,
            percent: type === "promo" ? percent : specialPercent,
            quantity: type === "promo" ? quantity : undefined,
            name: type === "special" ? name : undefined
        };
        try {
            const response = await this.updateDiscount(data);
            if (response.ok) {
                this.resetUpdateForm();
                const discountTableContainer = document.querySelector(".table__discount");
                if (discountTableContainer) {
                    await this.generateDiscountTable(discountTableContainer);
                }
            } else {
                throw new Error(`Ошибка: ${response.status}`);
            }
        } catch (error) {
            console.error("Ошибка при обновлении скидки:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async handleDeleteDiscount() {
        const id = this.discountDeleteId.value.trim();
        const type = this.discountDeleteType.value;

        if (!id || !type) {
            alert("Пожалуйста, выберите тип скидки и введите ID.");
            return;
        }

        try {
            const endpoint = type === "promo" 
                ? `/api/discount_code/${id}` 
                : `/api/discount_special/${id}`;
            const response = await fetch(endpoint, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            });

            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }

            this.resetDeleteForm();
            const discountTableContainer = document.querySelector(".table__discount");
            if (discountTableContainer) {
                await this.generateDiscountTable(discountTableContainer);
            }
        } catch (error) {
            console.error("Ошибка при удалении скидки:", error);
            alert("Произошла ошибка. Попробуйте снова.");
        }
    }

    async addDiscount(data) {
        const endpoint = data.type === "promo" ? "/api/discount_code" : "/api/discount_special";
        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }
            return response;
        } catch (error) {
            console.error("Ошибка при добавлении скидки:", error);
            throw error;
        }
    }

    async updateDiscount(data) {
        const endpoint = data.type === "promo" 
            ? "/api/discount_code" 
            : "/api/discount_special";
        try {
            const response = await fetch(endpoint, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data)
            });
            if (!response.ok) {
                throw new Error(`Ошибка: ${response.status}`);
            }
            return response;
        } catch (error) {
            console.error("Ошибка при обновлении скидки:", error);
            throw error;
        }
    }

    async deleteDiscount(data) {
        const response = await fetch(`/api/discounts/${data.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });
        return response;
    }

    resetAddForm() {
        this.discountAddType.value = "";
        this.discountAddCode.value = "";
        this.discountAddPercent.value = "";
        this.discountAddQuantity.value = "";
        this.discountAddName.value = "";
        this.discountAddSpecialPercent.value = "";
        this.toggleAddFields();
    }

    resetUpdateForm() {
        this.discountUpdateId.value = "";
        this.discountUpdateType.value = "";
        this.discountUpdateCode.value = "";
        this.discountUpdatePercent.value = "";
        this.discountUpdateQuantity.value = "";
        this.discountUpdateName.value = "";
        this.discountUpdateSpecialPercent.value = "";
        this.toggleUpdateFields();
    }

    resetDeleteForm() {
        this.discountDeleteId.value = "";
    }
}

const discountManager = new DiscountManager();
export { discountManager };
