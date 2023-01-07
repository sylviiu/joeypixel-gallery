const scaleAnim = (a) => {
    let currentAnim = null;

    a.onmouseenter = () => {
        if(currentAnim) {
            currentAnim.pause();
            currentAnim = null;
        };
        
        currentAnim = anime({
            targets: [a],
            scale: 1.2,
            easing: `easeOutExpo`,
            autoplay: true,
        });
    }

    a.onmouseleave = () => {
        if(currentAnim) {
            currentAnim.pause();
            currentAnim = null;
        };
        
        currentAnim = anime({
            targets: [a],
            scale: 1,
            easing: `easeOutExpo`,
            autoplay: true,
        });
    }
}

const scaleImageAnim = (a, file) => {
    let currentAnim = null;

    a.onmouseenter = () => {
        if(currentAnim) {
            currentAnim.pause();
            currentAnim = null;
        };

        if(file) console.log(file)
        
        currentAnim = anime({
            targets: [a],
            scale: 1.2,
            easing: `easeOutExpo`,
            autoplay: true,
        });
    }

    a.onmouseleave = () => {
        if(currentAnim) {
            currentAnim.pause();
            currentAnim = null;
        };
        
        currentAnim = anime({
            targets: [a],
            scale: 1,
            easing: `easeOutExpo`,
            autoplay: true,
        });
    }
}