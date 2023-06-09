<template>
    <Navbar/>

    <!-- Video Cards -->
    <div class="container">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 mt-4 mb-1">
            <VideoCardSkeleton v-if="loadedClips.length <= 0" v-for="i in 20"/>

            <div v-else v-for="video in loadedClips">
                <router-link :to="'/clip/' + video.video_id">
                    <VideoCard
                               :key="video.video_id"
                               :video_id="video.video_id"
                               :video_title="video.video_title"
                               :views="video.views"
                               :likes="video.likes"
                               :author="video.author"
                    />
                </router-link>
            </div>
        </div>
    </div>

    <!-- Video Player -->
    <div>
        <TransitionRoot appear :show="isPlayerOpen" as="template">
            <Dialog as="div" @close="closePlayer" class="relative z-10">
                <TransitionChild
                    as="template"
                    enter="duration-300 ease-out"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="duration-200 ease-in"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <div class="fixed inset-0 bg-black bg-opacity-25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-2 text-center">
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <DialogPanel class="transform overflow-hidden w-full max-w-4xl align-middle transition-all">
                                <div class="rounded-lg md:rounded-xl bg-[#242424] p-1 md:p-5 text-left">
                                    <VideoPlayer/>
                                </div>

                                <div v-if="showAdminControl" class="mt-2 rounded-lg md:rounded-xl bg-[#242424] p-2 text-left">
                                    <div class="flex justify-center gap-2">
                                        <button @click="deleteClip" class="bg-red-600 hover:bg-red-700 text-white py-1.5 px-3 rounded transition duration-200">
                                            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 96 960 960" width="24" fill="currentColor"><path d="M280 936q-33 0-56.5-23.5T200 856V336h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680 936H280Zm80-160h80V416h-80v360Zm160 0h80V416h-80v360Z"/></svg>
                                        </button>
                                    </div>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>

    <!-- Popup Dialog -->
    <div>
        <TransitionRoot appear :show="openPopup" as="template">
            <Dialog as="div" @close="openPopup = false" class="relative z-10">
                <TransitionChild
                    as="template"
                    enter="duration-300 ease-out"
                    enter-from="opacity-0"
                    enter-to="opacity-100"
                    leave="duration-200 ease-in"
                    leave-from="opacity-100"
                    leave-to="opacity-0"
                >
                    <div class="fixed inset-0 bg-black bg-opacity-25" />
                </TransitionChild>

                <div class="fixed inset-0 overflow-y-auto">
                    <div class="flex min-h-full items-center justify-center p-4 text-center">
                        <TransitionChild
                            as="template"
                            enter="duration-300 ease-out"
                            enter-from="opacity-0 scale-95"
                            enter-to="opacity-100 scale-100"
                            leave="duration-200 ease-in"
                            leave-from="opacity-100 scale-100"
                            leave-to="opacity-0 scale-95"
                        >
                            <DialogPanel class="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#242424] p-6 text-left align-middle shadow-xl transition-all">
                                <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-white">
                                    {{ popup.title }}
                                </DialogTitle>
                                <div class="mt-2">
                                    <p class="text-sm text-gray-400">
                                        {{ popup.message }}
                                    </p>
                                </div>

                                <div class="mt-4">
                                    <button type="button" class="inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-1 text-sm font-medium text-blue-900 hover:bg-blue-200 outline-none ring-0" @click="openPopup = false">
                                        {{ popup.button }}
                                    </button>
                                </div>
                            </DialogPanel>
                        </TransitionChild>
                    </div>
                </div>
            </Dialog>
        </TransitionRoot>
    </div>

    <!-- Loading spinner -->
    <div v-if="showLoadingSpinner" class="flex justify-center mb-6">
        <div class="loader">
            <svg class="circular">
                <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="3" stroke-miterlimit="10"/>
            </svg>
        </div>
    </div>
</template>

<script>
import VideoCard from "../components/VideoCard.vue";
import {Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot} from "@headlessui/vue";
import VideoPlayer from "../components/VideoPlayer.vue";
import {useVideoStore} from "../store/store.ts";
import Navbar from "../components/Navbar.vue";
import VideoCardSkeleton from "../components/skeleton/VideoCardSkeleton.vue";
import * as api from "../assets/api.ts"

export default {
    name: "HomeView",
    components: {
        VideoCardSkeleton,
        Navbar, VideoPlayer, Dialog, TransitionRoot, DialogTitle, DialogPanel, TransitionChild, VideoCard
    },
    setup() {
        const videoStore = useVideoStore()

        return {videoStore}
    },
    data() {
        return {
            isPlayerOpen: false,
            openPopup: false,
            loadedClips: [],
            lastIndex: 0,
            isLoadingClips: false,
            popup: {
                title: "",
                message: "",
                button: ""
            },
            showLoadingSpinner: false,
            showAdminControl: false,
        }
    },
    watch: {
        '$route.params.id': function (id) {
            if (id !== undefined) {
                if ((this.videoStore.playing_video_id === id) && (!this.videoStore.is_playing)) {
                    this.videoStore.setPlaying(true);
                    return;
                }
                this.playClip(id);
            } else {
                this.videoStore.setPlaying(false);
            }
        }
    },
    mounted() {
        const videoId = this.$route.params.id;
        if (videoId !== undefined) {
            this.playClip(videoId);
        }

        this.loadClips(20);

        this.videoStore.$subscribe((mutation, state) => {
            if (state.is_playing) {
                this.openPlayer()
            } else {
                this.closePlayer()
            }
        })

        this.handleRouteQuery();

        // Infinite scroll
        window.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

            if (scrollTop + clientHeight >= scrollHeight) {
                this.showLoadingSpinner = true;
                this.loadClips(10);
            }
        });

        if (this.videoStore.is_playing) {
            this.openPlayer()
        }

        this.showAdminControl = localStorage.getItem('delete_key') !== null || localStorage.getItem("approve_key") !== null;
    },
    methods: {
        loadClips(clips) {
            if (this.isLoadingClips) return;

            this.isLoadingClips = true;

            api.getApprovedClips(this.lastIndex, this.lastIndex + clips).then(data => {
                this.loadedClips.push(...data)
                this.lastIndex += clips
            }).catch(err => {
                console.error(err)
            }).finally(() => {
                this.isLoadingClips = false;
                this.showLoadingSpinner = false;
            });

        },
        closePlayer() {
            this.$router.replace({path: '/'})

            this.isPlayerOpen = false;
            this.videoStore.setPlaying(false)
        },
        openPlayer() {
            this.isPlayerOpen = true;
        },
        openDialog(title, message, button) {
            this.popup = {
                title: title,
                message: message,
                button: button
            }

            this.openPopup = true
        },
        reloadClips() {
            this.loadedClips = [];
            this.lastIndex = 0;
            this.loadClips(20);
        },
        deleteClip() {
            api.deleteVideo(this.videoStore.playing_video_id, localStorage.getItem("delete_key")).then(() => {
                this.openDialog(
                    "Clip deleted!",
                    "The clip has been deleted.",
                    "Got it"
                );
            }).catch(err => {
                console.error(err)
                this.openDialog(
                    "Error!",
                    "An error occurred while deleting your clip.",
                    "Ok"
                );
            }).finally(() => {
                this.videoStore.setPlaying(false);
                this.reloadClips();
            })
        },
        playClip(videoId) {
            if (this.videoStore.isVideoLoaded(videoId)) {
                this.videoStore.setPlayingVideoId(videoId);
                this.videoStore.setPlaying(true);
            } else {
                api.getVideo(videoId).then(data => {
                    if (Object.keys(data).length === 0) {
                        this.$router.replace({name: "NotFound"})
                    } else {
                        api.getVideoData(videoId).then(data => {
                            this.videoStore.putLoadedVideo(videoId, data);

                            this.videoStore.setPlayingVideoId(videoId);
                            this.videoStore.setPlaying(true);
                        });
                    }
                });
            }
        },
        handleRouteQuery() {
            if (this.$route.query.success === "true") {
                this.$router.replace({query: {}})

                this.openDialog(
                    "Clip submitted!",
                    "Your clip has been submitted for review. It will be added to the site shortly.",
                    "Got it, thanks!"
                )
            }

            if (this.$route.query.reason === "exists") {
                this.$router.replace({query: {}})

                this.openDialog(
                    "Clip already exists!",
                    "This clip has already been submitted to the site.",
                    "Got it"
                )
            }

            if (this.$route.query.reason === "invalid") {
                this.$router.replace({query: {}})

                this.openDialog(
                    "Invalid clip!",
                    "This clip is invalid and cannot be submitted to the site.",
                    "Got it"
                )
            }
        }
    }
}
</script>

<style scoped>
.loader {
    position: relative;
    margin: 0px auto;
    width: 100px;
    height: 100px;
    zoom: 1;
}

.circular {
    animation: rotate 1s linear infinite;
    height: 100px;
    position: relative;
    width: 100px;
}

.path {
    stroke: gray;
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
    animation: dash 1.5s ease-in-out infinite;
    stroke-linecap: round;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}
@keyframes dash {
    0% {
        stroke-dasharray: 1, 200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -35;
    }
    100% {
        stroke-dasharray: 89, 200;
        stroke-dashoffset: -124;
    }
}
</style>
