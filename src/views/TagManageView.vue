<script setup lang="ts">
import CommonLayout from '@/views/layouts/CommonLayout.vue'
import { getTags, createTag, updateTag, deleteTag, type Tag } from '@/api/tag'
import { ref, onMounted } from 'vue'
import { AxiosError } from 'axios'

const tags = ref<Tag[]>([])
const newTagName = ref('')
const updateTagName = ref('')
const themeColor = '#14b8a6'
const newTagColor = ref(themeColor)
const updateTagColor = ref()
const nameError = ref(false)
const showDeleteModal = ref(false)
const showUpdateModal = ref(false)
const deleteTargetId = ref<string | null>(null)
const updateTargetTag = ref<Tag | null>(null)
const createError = ref('')
const updateError = ref('')
const successMessage = ref('')

onMounted(async () => {
    try {
        const response = await getTags()
        tags.value = response.list
    } catch (e) {
        console.error('タグ取得失敗', e)
    }
})

const create = async () => {
    if (!newTagName.value.trim()) {
        nameError.value = true
        return
    }

    nameError.value = false

    try {
        await createTag(newTagName.value, newTagColor.value)
        const response = await getTags()
        tags.value = response.list
        newTagName.value = ''
        newTagColor.value = themeColor
        successMessage.value = 'タグを作成しました'
    } catch (e) {
        console.error('タグ作成失敗', e)
        const err = e as AxiosError<{ message: string }>
        createError.value = err?.response?.data?.message || '作成に失敗しました'
    }
}

const openUpdate = (tag: Tag) => {
    updateTargetTag.value = tag

    // 入力欄に現在の値をセット
    updateTagName.value = tag.tagName
    updateTagColor.value = tag.tagColor

    showUpdateModal.value = true
}
const update = async () => {
    if (!updateTargetTag.value) return
        const tag: Tag = {
        tagId: updateTargetTag.value.tagId,
        tagName: updateTagName.value,
        tagColor: updateTagColor.value
    }

    try {
        await updateTag(tag)
        const response = await getTags()
        tags.value = response.list
        successMessage.value = 'タグを更新しました'
    } catch (e) {
        console.error('タグ更新失敗', e)
        const err = e as AxiosError<{ message: string }>
        updateError.value = err?.response?.data?.message || '更新に失敗しました'
    } finally {
        showUpdateModal.value = false
        updateTargetTag.value = null
    }
}

const openDelete = (tagId: string) => {
    deleteTargetId.value = tagId
    showDeleteModal.value = true
}
const remove = async (tagId: string) => {
    if (!deleteTargetId.value) return

    try {
        await deleteTag(tagId)
        const response = await getTags()
        tags.value = response.list
        successMessage.value = 'タグを削除しました'
    } catch (e) {
        console.error('タグ削除失敗', e)
    } finally {
        showDeleteModal.value = false
        deleteTargetId.value = null
    }
}

const getTextColor = (bg: string) => {
    const c = bg.substring(1) // remove #
    const rgb = parseInt(c, 16)
    const r = (rgb >> 16) & 0xff
    const g = (rgb >> 8) & 0xff
    const b = rgb & 0xff
    const brightness = (r * 299 + g * 587 + b * 114) / 1000
    return brightness > 150 ? '#0f172a' : '#ffffff'
}
</script>
<template>
    <CommonLayout>

        <div class="card tag-manage-card">
            <h2 class="page-title">タグ管理</h2>

            <!-- 追加エリア -->
            <div class="create-row">
                <input v-model="newTagName" :placeholder="nameError ? 'タグ名を入力してください' : 'タグ名'" class="tag-input"
                    :class="{ 'input-error': nameError }" @input="nameError = false" />

                <div class="color-wrapper">
                    <label class="color-button" :style="{
                        backgroundColor: newTagColor,
                        color: getTextColor(newTagColor)
                    }">
                        タグ色
                        <input type="color" v-model="newTagColor" class="color-input" />
                    </label>
                </div>

                <button class="primary-btn" @click="create">
                    追加
                </button>
            </div>

            <!-- 区切り -->
            <div class="divider" />

            <!-- 一覧（ここだけスクロール） -->
            <div class="tag-list">
                <div v-for="tag in tags" :key="tag.tagId" class="tag-card">
                    <div class="tag-card-header">
                        <span class="tag-badge" :style="{ backgroundColor: tag.tagColor }">
                            {{ tag.tagName }}
                        </span>

                        <div class="tag-actions">
                            <button class="outline-btn" @click="openUpdate(tag)">編集</button>
                            <button class="outline-btn danger" @click="openDelete(tag.tagId)">削除</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="back-link-wrapper">
                <router-link to="/dashboard" class="back-link">
                    ← ダッシュボードへ戻る
                </router-link>
            </div>

        </div>

    </CommonLayout>
    <div v-if="showDeleteModal" class="modal-overlay">
        <div class="modal">
            <p>このタグを削除しますか？</p>

            <div class="modal-actions">
                <button class="outline-btn" @click="showDeleteModal = false">
                    キャンセル
                </button>
                <button class="primary-btn" @click="remove(deleteTargetId!)">
                    削除する
                </button>
            </div>
        </div>
    </div>
    <div v-if="showUpdateModal" class="modal-overlay">
        <div class="modal">
            <div class="create-row">
                <input v-model="updateTagName" :placeholder="nameError ? 'タグ名を入力してください' : updateTargetTag?.tagName"
                    class="tag-input" :class="{ 'input-error': nameError }" @input="nameError = false" />

                <div class="color-wrapper">
                    <label class="color-button" :style="{
                        backgroundColor: updateTagColor,
                        color: getTextColor(updateTargetTag!.tagColor)
                    }">
                        タグ色
                        <input type="color" v-model="updateTagColor" class="color-input" />
                    </label>
                </div>
            </div>
            <div class="modal-actions">
                <button class="outline-btn" @click="showUpdateModal = false">
                    キャンセル
                </button>
                <button class="primary-btn" @click="update()">
                    更新
                </button>
            </div>
        </div>
    </div>
    <div v-if="createError" class="modal-overlay">
        <div class="modal">
            <p>{{ createError }}</p>
            <div class="modal-actions">
                <button class="outline-btn" @click="createError = ''">
                    閉じる
                </button>
            </div>
        </div>
    </div>
    <div v-if="updateError" class="modal-overlay">
        <div class="modal">
            <p>{{ updateError }}</p>
            <div class="modal-actions">
                <button class="outline-btn" @click="updateError = ''">
                    閉じる
                </button>
            </div>
        </div>
    </div>
    <div v-if="successMessage" class="modal-overlay">
        <div class="modal">
            <p>{{ successMessage }}</p>
            <div class="modal-actions">
                <button class="outline-btn" @click="successMessage = ''">
                    閉じる
                </button>
            </div>
        </div>
    </div>
</template>
<style scoped>
.page-title {
    margin-bottom: 20px;
    font-size: 22px;
    font-weight: 700;
    color: #0f766e;
}

input,
select {
    padding: 12px;
    border-radius: 12px;
    border: 1px solid #cbd5e1;
    outline: none;
    transition: 0.2s;
}

input:focus,
select:focus {
    border-color: #14b8a6;
    box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.2);
}

.tag-card {
    padding: 16px;
    border-radius: 16px;
    background: white;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.05);
    transition: 0.2s;
}

.tag-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 22px rgba(0, 0, 0, 0.08);
}

.tag-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.create-row {
    display: flex;
    align-items: center;
    gap: 12px;
}

.tag-list {
    flex: 1;
    /* ← ここ超重要 */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.tag-list::-webkit-scrollbar {
    width: 8px;
}

.tag-list::-webkit-scrollbar-track {
    background: transparent;
}

.tag-list::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 10px;
    transition: 0.2s;
}

.tag-list::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
}

.tag-input {
    flex: 1;
    min-width: 0;
}

.divider {
    margin: 20px 0;
    height: 1px;
    background: #e2e8f0;
}

.divider {
    margin: 20px 0;
    height: 1px;
    background: #e2e8f0;
}

.tag-badge {
    padding: 4px 12px;
    border-radius: 999px;
    color: white;
    font-weight: 600;
    font-size: 12px;
}

.tag-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tag-row {
    padding: 8px 4px;
    border-radius: 12px;
    transition: 0.2s;
}

.tag-row:hover {
    background: #f8fafc;
}

.outline-btn {
    padding: 6px 14px;
    border-radius: 10px;
    border: 2px solid #14b8a6;
    background: white;
    color: #14b8a6;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}

.outline-btn:hover {
    background: #f0fdfa;
}

/* 削除用 */
.outline-btn.danger {
    border-color: #ef4444;
    color: #ef4444;
}

.outline-btn.danger:hover {
    background: #fef2f2;
}

.tag-manage-card {
    width: 100%;
    max-width: 1000px;
    /* ← 好きな幅に調整（1100でもOK） */
    margin: 0 auto;

    display: flex;
    flex-direction: column;
    height: 80vh;
}

.tag-actions {
    display: flex;
    gap: 12px;
    /* ← ボタン間余白 */
}

.color-wrapper {
    position: relative;
}

/* 実際に見えるボタン */
.color-button {
    padding: 10px 16px;
    border-radius: 12px;
    border: none;
    color: white;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
}

.color-button:hover {
    filter: brightness(1.1);
}

/* 本物のカラーパレットは透明にして上に重ねる */
.color-input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
}

@media (max-width: 600px) {
    .primary-btn {
        padding: 8px 14px;
        font-size: 13px;
        border-radius: 10px;
    }

    .create-row {
        gap: 8px;
    }

    .tag-input {
        font-size: 14px;
        padding: 10px;
    }

    .color-button {
        padding: 8px 12px;
        font-size: 13px;
        border-radius: 10px;
    }

    .outline-btn {
        padding: 5px 10px;
        font-size: 12px;
        border-radius: 8px;
    }

    .tag-card {
        padding: 14px 16px;
    }
}

.input-error::placeholder {
    color: #ef4444;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal {
    background: white;
    padding: 24px;
    border-radius: 16px;
    width: 320px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.modal-actions {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.back-link-wrapper {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #eee;
    text-align: center;
}

.back-link {
    color: var(--theme-color);
    text-decoration: none;
    font-weight: 500;
    transition: 0.2s;
}

.back-link:hover {
    opacity: 0.7;
}
</style>
